export const dashboardStats = {
  totalCustomers: 198,
  activeLoans: 87,
  closedLoans: 142,
  pendingEMI: 34,
  totalChitFunds: 12,
  monthlyIncome: 845000,
  monthlyPending: 234000,
  overdueCustomers: 8,
  newCustomersThisMonth: 14,
};

export const revenueData = [
  { month: "Jan", income: 720000, collected: 680000 },
  { month: "Feb", income: 780000, collected: 740000 },
  { month: "Mar", income: 810000, collected: 790000 },
  { month: "Apr", income: 750000, collected: 710000 },
  { month: "May", income: 830000, collected: 800000 },
  { month: "Jun", income: 845000, collected: 780000 },
];

export const loanDistribution = [
  { name: "Personal Loan", value: 52, fill: "hsl(var(--chart-1))" },
  { name: "Gold Loan", value: 28, fill: "hsl(var(--chart-2))" },
  { name: "Emergency Loan", value: 7, fill: "hsl(var(--chart-3))" },
];

export const recentActivities = [
  { id: 1, type: "payment", message: "EMI payment received from Rajesh Kumar", amount: 12500, time: "10 min ago" },
  { id: 2, type: "loan", message: "New loan approved for Priya Sharma", amount: 200000, time: "1 hr ago" },
  { id: 3, type: "customer", message: "New customer registered: Anil Reddy", time: "2 hrs ago" },
  { id: 4, type: "chit", message: "Chit fund auction completed - Group A", amount: 500000, time: "3 hrs ago" },
  { id: 5, type: "overdue", message: "EMI overdue alert: Suresh Patel", amount: 8500, time: "5 hrs ago" },
];

export const topDefaulters = [
  { name: "Suresh Patel", amount: 45000, daysOverdue: 32, risk: "high" },
  { name: "Ramesh Yadav", amount: 28000, daysOverdue: 18, risk: "medium" },
  { name: "Kavitha Nair", amount: 15000, daysOverdue: 12, risk: "medium" },
  { name: "Dinesh Gupta", amount: 8500, daysOverdue: 7, risk: "low" },
];

export const customers = [
  { id: "CUS001", name: "Rajesh Kumar", mobile: "9876543210", occupation: "Business", monthlyIncome: 75000, cibilScore: 720, activeLoans: 2, status: "active" },
  { id: "CUS002", name: "Priya Sharma", mobile: "9876543211", occupation: "Salaried", monthlyIncome: 45000, cibilScore: 680, activeLoans: 1, status: "active" },
  { id: "CUS003", name: "Anil Reddy", mobile: "9876543212", occupation: "Self-employed", monthlyIncome: 60000, cibilScore: 750, activeLoans: 0, status: "active" },
  { id: "CUS004", name: "Suresh Patel", mobile: "9876543213", occupation: "Business", monthlyIncome: 90000, cibilScore: 580, activeLoans: 3, status: "overdue" },
  { id: "CUS005", name: "Meena Devi", mobile: "9876543214", occupation: "Salaried", monthlyIncome: 35000, cibilScore: 700, activeLoans: 1, status: "active" },
  { id: "CUS006", name: "Ramesh Yadav", mobile: "9876543215", occupation: "Farmer", monthlyIncome: 25000, cibilScore: 620, activeLoans: 2, status: "overdue" },
  { id: "CUS007", name: "Lakshmi Iyer", mobile: "9876543216", occupation: "Teacher", monthlyIncome: 40000, cibilScore: 760, activeLoans: 0, status: "active" },
  { id: "CUS008", name: "Venkat Rao", mobile: "9876543217", occupation: "Business", monthlyIncome: 120000, cibilScore: 800, activeLoans: 1, status: "active" },
];

export const loans = [
  { id: "LN001", customerId: "CUS001", customerName: "Rajesh Kumar", type: "Personal Loan", amount: 200000, interest: 14, duration: 24, emi: 9614, startDate: "2024-01-15", status: "active", paid: 8, remaining: 16 },
  { id: "LN002", customerId: "CUS002", customerName: "Priya Sharma", type: "Gold Loan", amount: 150000, interest: 10, duration: 12, emi: 13215, startDate: "2024-03-01", status: "active", paid: 3, remaining: 9 },
  { id: "LN003", customerId: "CUS004", customerName: "Suresh Patel", type: "Personal Loan", amount: 500000, interest: 16, duration: 36, emi: 17584, startDate: "2023-06-10", status: "overdue", paid: 10, remaining: 26 },
  { id: "LN004", customerId: "CUS001", customerName: "Rajesh Kumar", type: "Gold Loan", amount: 100000, interest: 9, duration: 12, emi: 8745, startDate: "2024-02-20", status: "active", paid: 4, remaining: 8 },
  { id: "LN005", customerId: "CUS006", customerName: "Ramesh Yadav", type: "Emergency Loan", amount: 50000, interest: 18, duration: 6, emi: 8926, startDate: "2024-04-01", status: "overdue", paid: 1, remaining: 5 },
  { id: "LN006", customerId: "CUS008", customerName: "Venkat Rao", type: "Personal Loan", amount: 300000, interest: 12, duration: 24, emi: 14122, startDate: "2024-01-05", status: "active", paid: 6, remaining: 18 },
];

export const chitFunds = [
  { id: "CHT001", name: "Gold Chit A", totalMembers: 20, currentMembers: 20, monthlyAmount: 10000, duration: 20, totalValue: 200000, startDate: "2024-01-01", status: "active", completedMonths: 6 },
  { id: "CHT002", name: "Silver Chit B", totalMembers: 15, currentMembers: 14, monthlyAmount: 5000, duration: 15, totalValue: 75000, startDate: "2024-02-01", status: "active", completedMonths: 5 },
  { id: "CHT003", name: "Diamond Chit C", totalMembers: 25, currentMembers: 25, monthlyAmount: 20000, duration: 25, totalValue: 500000, startDate: "2023-10-01", status: "active", completedMonths: 9 },
];
