import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
})

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { email, password, name } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'Email already in use' } },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(users).values({
    email,
    name,
    passwordHash,
    plan: 'free',
  }).returning();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    },
  }, { status: 201 });
}