import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードは必須です' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: '既に登録されています' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    console.error('サインアップエラー:', e);
    return NextResponse.json({ error: `登録に失敗しました: ${e instanceof Error ? e.message : 'データベースエラー'}` }, { status: 500 });
  }
} 