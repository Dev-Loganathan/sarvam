import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Utility for calculating risk based on frontend logic
export function calculateRisk(
  cibilScore: number,
  monthlyIncome: number,
  monthlyEmi: number
): { riskLevel: string; category: string } {
  const dti = monthlyIncome > 0 ? monthlyEmi / monthlyIncome : 1;
  let score = 0;
  if (cibilScore >= 750) score += 3;
  else if (cibilScore >= 700) score += 2;
  else if (cibilScore >= 650) score += 1;

  if (dti < 0.3) score += 2;
  else if (dti < 0.5) score += 1;

  let riskLevel = 'very_high';
  if (score >= 4) riskLevel = 'low';
  else if (score === 3) riskLevel = 'medium';
  else if (score === 2) riskLevel = 'high';

  let category = 'risky';
  if (cibilScore >= 780) category = 'excellent';
  else if (cibilScore >= 720) category = 'good';
  else if (cibilScore >= 650) category = 'medium';

  return { riskLevel, category };
}

// Ensure unique customer code
async function generateCustomerCode(): Promise<string> {
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { customerCode: 'desc' },
  });
  
  if (!lastCustomer) {
    return 'CUS1000';
  }
  
  const lastIdStr = lastCustomer.customerCode.replace('CUS', '');
  const nextId = parseInt(lastIdStr) + 1;
  return `CUS${String(nextId).padStart(4, '0')}`;
}

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
      include: {
        documents: true,
        notes: { orderBy: { createdAt: 'desc' } },
        auditLogs: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { documents, notes, auditLogs, id, createdAt, updatedAt, ...data } = req.body;
    
    const income = (data.monthlySalary || 0) + (data.additionalIncome || 0);
    const { riskLevel, category } = calculateRisk(data.cibilScore || 700, income, data.monthlyEmi || 0);
    
    const customerCode = await generateCustomerCode();

    const newCustomer = await prisma.customer.create({
      data: {
        ...data,
        customerCode,
        riskLevel,
        category,
        documents: documents?.length ? {
          create: documents.map((d: any) => ({
            type: d.type,
            name: d.name,
            mimeType: d.mimeType,
            size: d.size,
            dataUrl: d.dataUrl
          }))
        } : undefined,
        auditLogs: {
          create: {
            action: 'Created',
            details: `Onboarded ${data.firstName}`,
            user: 'Admin'
          }
        }
      }
    });
    
    res.status(201).json(newCustomer);
  } catch (error: any) {
    console.error('Failed to create customer. Payload:', req.body);
    console.error('Prisma Error:', error?.message || error);
    res.status(500).json({ error: 'Failed to create customer', details: error?.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { documents, notes, auditLogs, id, createdAt, updatedAt, ...data } = req.body;
    
    // Recalculate risk if financials changed
    let riskUpdates = {};
    if (data.cibilScore !== undefined || data.monthlySalary !== undefined || data.monthlyEmi !== undefined) {
      const existing = await prisma.customer.findUnique({ where: { id: req.params.id as string } });
      if (existing) {
        const cibil = data.cibilScore ?? existing.cibilScore;
        const salary = data.monthlySalary ?? existing.monthlySalary;
        const additional = data.additionalIncome ?? existing.additionalIncome ?? 0;
        const emi = data.monthlyEmi ?? existing.monthlyEmi;
        const income = salary + additional;
        
        const { riskLevel, category } = calculateRisk(cibil, income, emi);
        riskUpdates = { riskLevel, category };
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        ...riskUpdates,
        auditLogs: {
          create: {
            action: 'Updated',
            details: 'Profile details edited',
            user: 'Admin'
          }
        }
      }
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const updateCustomerStatus = async (req: Request, res: Response) => {
  try {
    const { status, inactiveReason, inactiveNote } = req.body;
    
    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: {
        status,
        inactiveReason: status === 'inactive' ? inactiveReason : null,
        inactiveNote: status === 'inactive' ? inactiveNote : null,
        inactiveAt: status === 'inactive' ? new Date() : null,
        auditLogs: {
          create: {
            action: status === 'inactive' ? 'Marked Inactive' : 'Reactivated',
            details: inactiveNote,
            user: 'Admin'
          }
        }
      }
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update customer status' });
  }
};

export const addNote = async (req: Request, res: Response) => {
  try {
    const { note } = req.body;
    const newNote = await prisma.customerNote.create({
      data: {
        customerId: req.params.id as string,
        note,
        createdBy: 'Admin'
      }
    });
    // Log audit
    await prisma.auditEntry.create({
      data: {
        customerId: req.params.id as string,
        action: 'Note added',
        user: 'Admin'
      }
    });
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

export const addDocument = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Before adding, if it's the same type, we should probably delete the old one, but frontend handles that for now
    const newDoc = await prisma.customerDocument.create({
      data: {
        ...data,
        customerId: req.params.id as string
      }
    });
    res.status(201).json(newDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add document' });
  }
};

export const removeDocument = async (req: Request, res: Response) => {
  try {
    await prisma.customerDocument.delete({
      where: { id: req.params.docId as string }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove document' });
  }
};
