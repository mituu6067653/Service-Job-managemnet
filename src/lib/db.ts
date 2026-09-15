// Mock Data Storage for Client Demo Mode (No Database / Prisma required)

export const mockBusiness = {
  id: 'demo-business-id',
  name: 'Apex HVAC & Appliance Repair',
  slug: 'apex-hvac-services',
  email: 'contact@apexhvac.com',
  phone: '+91 98765 00000',
  address: '102 Industrial Estate, Sector 5, Tech City',
  taxNumber: 'GSTIN29ABCDE1234F1Z5',
};

export const mockUsers = [
  {
    id: 'demo-admin-id',
    businessId: 'demo-business-id',
    name: 'Rajesh Kumar (Admin)',
    email: 'admin@apexhvac.com',
    role: 'ADMIN',
    isActive: true,
    business: mockBusiness,
  },
  {
    id: 'demo-manager-id',
    businessId: 'demo-business-id',
    name: 'Anita Verma (Manager)',
    email: 'manager@apexhvac.com',
    role: 'MANAGER',
    isActive: true,
    business: mockBusiness,
  },
  {
    id: 'demo-tech-id',
    businessId: 'demo-business-id',
    name: 'Vikram Singh (Technician)',
    email: 'vikram@apexhvac.com',
    role: 'TECHNICIAN',
    isActive: true,
    business: mockBusiness,
  },
];

export const mockCustomers = [
  {
    id: 'cust-1',
    businessId: 'demo-business-id',
    name: 'Sharma Heights Society',
    phone: '+91 98111 22334',
    email: 'manager@sharmaheights.com',
    address: 'Flat 402, Building A, Sharma Heights, Civil Lines',
    notes: 'Requires advance entry call before arriving',
    isArchived: false,
    createdAt: new Date(),
  },
  {
    id: 'cust-2',
    businessId: 'demo-business-id',
    name: 'Priya Verma',
    phone: '+91 99888 77665',
    email: 'priya.v@gmail.com',
    address: 'Villa 14, Royal Palm Residency',
    notes: 'Call before arriving',
    isArchived: false,
    createdAt: new Date(),
  },
];

export const mockTechnicians = [
  {
    id: 'tech-1',
    businessId: 'demo-business-id',
    name: 'Vikram Singh',
    phone: '+91 98765 22222',
    email: 'vikram@apexhvac.com',
    specialization: 'Air Conditioner & Refrigeration Expert',
    isActive: true,
    jobs: [
      { id: 'job-1', status: 'IN_PROGRESS', isArchived: false },
    ],
  },
  {
    id: 'tech-2',
    businessId: 'demo-business-id',
    name: 'Amit Sharma',
    phone: '+91 98765 33333',
    email: 'amit@apexhvac.com',
    specialization: 'Electrical & Plumbing Specialist',
    isActive: true,
    jobs: [
      { id: 'job-2', status: 'SCHEDULED', isArchived: false },
    ],
  },
];

export const mockJobs = [
  {
    id: 'job-1',
    jobCode: 'JOB-1001',
    businessId: 'demo-business-id',
    customerId: 'cust-1',
    technicianId: 'tech-1',
    title: 'AC Cooling Failure & Gas Leak Check',
    description: 'Master bedroom 1.5 ton split AC not cooling. Frequent tripping.',
    address: 'Flat 402, Building A, Sharma Heights, Civil Lines',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '11:00 AM - 01:00 PM',
    estimatedCost: 2499,
    isArchived: false,
    createdAt: new Date(),
    customer: mockCustomers[0],
    technician: mockTechnicians[0],
  },
  {
    id: 'job-2',
    jobCode: 'JOB-1002',
    businessId: 'demo-business-id',
    customerId: 'cust-2',
    technicianId: 'tech-2',
    title: 'Washing Machine Drain Pipe Replacement',
    description: 'Water leaking during spin cycle.',
    address: 'Villa 14, Royal Palm Residency',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '03:00 PM - 05:00 PM',
    estimatedCost: 850,
    isArchived: false,
    createdAt: new Date(),
    customer: mockCustomers[1],
    technician: mockTechnicians[1],
  },
];

export const mockInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-1001',
    businessId: 'demo-business-id',
    customerId: 'cust-1',
    jobId: 'job-1',
    subtotal: 2499,
    taxAmount: 449.82,
    discountAmount: 0,
    totalAmount: 2948.82,
    paidAmount: 1000,
    status: 'PARTIALLY_PAID',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isArchived: false,
    customer: mockCustomers[0],
    items: [
      {
        id: 'inv-item-1',
        description: 'AC Deep Servicing & Gas Refill',
        quantity: 1,
        unitPrice: 2499,
        total: 2499,
      },
    ],
  },
];

// Mock Proxy to safely mimic Prisma DB calls without crashing
const createMockHandler = () => {
  return {
    user: {
      findUnique: async ({ where }: any) => {
        if (where.id) return mockUsers.find((u) => u.id === where.id) || mockUsers[0];
        if (where.email) return mockUsers.find((u) => u.email === where.email) || mockUsers[0];
        return mockUsers[0];
      },
      findMany: async () => mockUsers,
      count: async () => mockUsers.length,
    },
    customer: {
      findMany: async () => mockCustomers,
      findUnique: async ({ where }: any) => mockCustomers.find((c) => c.id === where.id) || mockCustomers[0],
      count: async () => mockCustomers.length,
      create: async ({ data }: any) => ({ id: `cust-${Date.now()}`, ...data }),
      update: async ({ data }: any) => ({ ...mockCustomers[0], ...data }),
    },
    technician: {
      findMany: async () => mockTechnicians,
      findUnique: async ({ where }: any) => mockTechnicians.find((t) => t.id === where.id) || mockTechnicians[0],
      count: async () => mockTechnicians.length,
    },
    job: {
      findMany: async () => mockJobs,
      findUnique: async ({ where }: any) => mockJobs.find((j) => j.id === where.id) || mockJobs[0],
      count: async ({ where }: any) => {
        if (where?.status) return mockJobs.filter((j) => j.status === where.status).length;
        return mockJobs.length;
      },
      create: async ({ data }: any) => ({ id: `job-${Date.now()}`, ...data }),
      update: async ({ data }: any) => ({ ...mockJobs[0], ...data }),
    },
    invoice: {
      findMany: async () => mockInvoices,
      findUnique: async ({ where }: any) => mockInvoices.find((i) => i.id === where.id) || mockInvoices[0],
      count: async () => mockInvoices.length,
      aggregate: async () => ({
        _sum: { totalAmount: 2948.82, paidAmount: 1000 },
      }),
    },
    payment: {
      findMany: async () => [],
      count: async () => 0,
    },
    serviceCatalog: {
      findMany: async () => [],
    },
    serviceRequest: {
      findMany: async () => [],
      count: async () => 0,
    },
    auditLog: {
      create: async () => ({}),
      findMany: async () => [],
    },
    $transaction: async (fn: any) => {
      const txMock = createMockHandler();
      return await fn(txMock);
    },
  };
};

export const db: any = createMockHandler();
