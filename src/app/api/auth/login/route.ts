import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { comparePassword, createSessionToken, setSessionCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email },
      include: { business: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid email or account is inactive' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(validated.password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
      businessName: user.business.name,
    });

    await setSessionCookie(token);

    // Audit log
    await db.auditLog.create({
      data: {
        businessId: user.businessId,
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        businessName: user.business.name,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
