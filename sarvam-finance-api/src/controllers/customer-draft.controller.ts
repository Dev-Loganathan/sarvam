import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { z } from 'zod';

const saveDraftSchema = z.object({
  id: z.string().uuid().optional(),
  data: z.any(),
  step: z.number().int().min(1).max(6).optional()
});

export const saveDraft = async (req: Request, res: Response) => {
  try {
    const { id, data, step } = saveDraftSchema.parse(req.body);
    
    if (id) {
      // Check if draft exists
      const existingDraft = await prisma.customerDraft.findUnique({
        where: { id: id as string }
      });
      
      if (existingDraft) {
        const updated = await prisma.customerDraft.update({
          where: { id: id as string },
          data: { data, step: step ?? 1 }
        });
        return res.json(updated);
      }
    }
    
    // Create new draft
    const newDraft = await prisma.customerDraft.create({
      data: {
        data,
        step: step ?? 1
      }
    });
    
    return res.status(201).json(newDraft);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: (error as any).errors });
    }
    console.error('Error saving customer draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
};

export const getDrafts = async (req: Request, res: Response) => {
  try {
    const drafts = await prisma.customerDraft.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(drafts);
  } catch (error) {
    console.error('Error fetching customer drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
};

export const getDraftById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const draft = await prisma.customerDraft.findUnique({
      where: { id }
    });
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    res.json(draft);
  } catch (error) {
    console.error('Error fetching customer draft by id:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
};

export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Check if draft exists
    const draft = await prisma.customerDraft.findUnique({
      where: { id }
    });
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    await prisma.customerDraft.delete({
      where: { id }
    });
    
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
};
