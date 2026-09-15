import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const DEMO_USERS: Record<string, { id: string; name: string; email: string; role: string; businessId: string; businessName: string }> = {
  'admin@apexhvac.com': {
    id: 'demo-admin-id',
    name: 'Rajesh Kumar (Admin)',
    email: 'admin@apexhvac.com',
    role: 'ADMIN',
    businessId: 'demo-business-id',
    businessName: 'Apex HVAC & Appliance Repair',
  },
  'manager@apexhvac.com': {
    id: 'demo-manager-id',
    name: 'Anita Verma (Manager)',
    email: 'manager@apexhvac.com',
    role: 'MANAGER',
    businessId: 'demo-business-id',
    businessName: 'Apex HVAC & Appliance Repair',
  },
  'vikram@apexhvac.com': {
    id: 'demo-tech-id',
    name: 'Vikram Singh (Technician)',
    email: 'vikram@apexhvac.com',
    role: 'TECHNICIAN',
    businessId: 'demo-business-id',
    businessName: 'Apex HVAC & Appliance Repair',
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const email = validated.email.toLowerCase();
    const user = DEMO_USERS[email];

    // Simple mock auth for client demo (no DB dependency)
    if (user) {
      const token = await createSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessId: user.businessId,
        businessName: user.businessName,
      });

      await setSessionCookie(token);

      return NextResponse.json({
        success: true,
        user: user,
      });
    }

    // Default fallback demo login for any other email
    const customUser = {
      id: `demo-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'ADMIN',
      businessId: 'demo-business-id',
      businessName: 'Apex HVAC & Appliance Repair',
    };

    const token = await createSessionToken({
      userId: customUser.id,
      email: customUser.email,
      name: customUser.name,
      role: customUser.role,
      businessId: customUser.businessId,
      businessName: customUser.businessName,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: customUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
