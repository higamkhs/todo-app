import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'タスクの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  try {
    const { title } = await req.json();
    const todo = await prisma.todo.create({
      data: {
        title,
        userId: token.sub,
      },
    });
    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'タスクの作成に失敗しました' }, { status: 500 });
  }
} 