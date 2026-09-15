import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

const registerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  adminName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check existing email
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Generate business slug
    const slug = validated.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const hashedPassword = await hashPassword(validated.password);

    // Create Business & Admin User transactionally
    const result = await db.$transaction(async (tx: any) => {
      const business = await tx.business.create({
        data: {
          name: validated.businessName,
          slug,
          email: validated.email,
          phone: validated.phone,
        },
      });

      const user = await tx.user.create({
        data: {
          businessId: business.id,
          name: validated.adminName,
          email: validated.email,
          password: hashedPassword,
          phone: validated.phone,
          role: 'ADMIN',
        },
      });

      await tx.auditLog.create({
        data: {
          businessId: business.id,
          userId: user.id,
          action: 'REGISTER_BUSINESS',
          entity: 'Business',
          entityId: business.id,
          metadata: JSON.stringify({ businessName: business.name }),
        },
      });

      return { business, user };
    });

    // Create Session
    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      businessId: result.business.id,
      businessName: result.business.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        businessId: result.business.id,
        businessName: result.business.name,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
