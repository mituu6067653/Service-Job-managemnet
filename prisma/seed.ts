import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ServiceFlow database...');

  // Create Business
  const business = await prisma.business.upsert({
    where: { slug: 'apex-hvac-services' },
    update: {},
    create: {
      name: 'Apex HVAC & Appliance Repair',
      slug: 'apex-hvac-services',
      email: 'contact@apexhvac.com',
      phone: '+91 98765 00000',
      address: '102 Industrial Estate, Sector 5, Tech City',
      taxNumber: 'GSTIN29ABCDE1234F1Z5',
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const techPassword = await bcrypt.hash('tech123', 10);

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@apexhvac.com' },
    update: {},
    create: {
      businessId: business.id,
      name: 'Rajesh Kumar (Admin)',
      email: 'admin@apexhvac.com',
      password: hashedPassword,
      phone: '+91 98765 11111',
      role: 'ADMIN',
    },
  });

  // Create Technicians
  const techUser1 = await prisma.user.upsert({
    where: { email: 'vikram@apexhvac.com' },
    update: {},
    create: {
      businessId: business.id,
      name: 'Vikram Singh',
      email: 'vikram@apexhvac.com',
      password: techPassword,
      phone: '+91 98765 22222',
      role: 'TECHNICIAN',
    },
  });

  const tech1 = await prisma.technician.create({
    data: {
      businessId: business.id,
      name: 'Vikram Singh',
      phone: '+91 98765 22222',
      email: 'vikram@apexhvac.com',
      specialization: 'Air Conditioner & Refrigeration Expert',
    },
  });

  await prisma.profileTechnician.create({
    data: {
      userId: techUser1.id,
      technicianId: tech1.id,
    },
  });

  const tech2 = await prisma.technician.create({
    data: {
      businessId: business.id,
      name: 'Amit Sharma',
      phone: '+91 98765 33333',
      email: 'amit@apexhvac.com',
      specialization: 'Electrical & Plumbing Specialist',
    },
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Sharma Heights Society',
      phone: '+91 98111 22334',
      email: 'manager@sharmaheights.com',
      address: 'Flat 402, Building A, Sharma Heights, Civil Lines',
      notes: 'Requires advance entry call before arriving',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Priya Verma',
      phone: '+91 99888 77665',
      email: 'priya.v@gmail.com',
      address: 'Villa 14, Royal Palm Residency',
    },
  });

  // Create Services Catalog
  const service1 = await prisma.serviceCatalog.create({
    data: {
      businessId: business.id,
      name: 'AC Deep Servicing & Gas Refill',
      description: 'Complete high-pressure jet cleaning and R32/R410 gas pressure test.',
      basePrice: 2499,
      category: 'HVAC',
    },
  });

  const service2 = await prisma.serviceCatalog.create({
    data: {
      businessId: business.id,
      name: 'Washing Machine Inspection & Repair',
      description: 'Drum noise check, motor inspection, and inlet valve replacement.',
      basePrice: 850,
      category: 'Appliance Repair',
    },
  });

  // Create Jobs
  const job1 = await prisma.job.create({
    data: {
      jobCode: 'JOB-1001',
      businessId: business.id,
      customerId: customer1.id,
      technicianId: tech1.id,
      serviceCatalogId: service1.id,
      title: 'AC Cooling Failure & Gas Leak Check',
      description: 'Master bedroom 1.5 ton split AC not cooling. Frequent tripping.',
      address: customer1.address,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '11:00 AM - 01:00 PM',
      estimatedCost: 2499,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      jobCode: 'JOB-1002',
      businessId: business.id,
      customerId: customer2.id,
      technicianId: tech2.id,
      serviceCatalogId: service2.id,
      title: 'Washing Machine Drain Pipe Replacement',
      description: 'Water leaking during spin cycle.',
      address: customer2.address,
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '03:00 PM - 05:00 PM',
      estimatedCost: 850,
    },
  });

  // Create Invoice for Job 1
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-1001',
      businessId: business.id,
      customerId: customer1.id,
      jobId: job1.id,
      subtotal: 2499,
      taxAmount: 449.82,
      discountAmount: 0,
      totalAmount: 2948.82,
      paidAmount: 1000,
      status: 'PARTIALLY_PAID',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: {
        create: [
          {
            description: 'AC Deep Servicing & Gas Refill',
            quantity: 1,
            unitPrice: 2499,
            total: 2499,
          },
        ],
      },
    },
  });

  // Record Partial Payment
  await prisma.payment.create({
    data: {
      businessId: business.id,
      invoiceId: invoice1.id,
      amount: 1000,
      method: 'UPI',
      transactionId: 'UPI-992010293812',
      notes: 'Advance payment received via PhonePe',
    },
  });

  console.log('Database successfully seeded with demo business!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
