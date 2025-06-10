import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function PATCH(
  req: Request,
  context: any
) {
  const { params } = context;
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  try {
    const { completed, title } = await req.json();
    // 自分のタスクか確認
    const todo = await prisma.todo.findUnique({ where: { id: parseInt(params.id) } });
    if (!todo || todo.userId !== token.sub) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    const updated = await prisma.todo.update({
      where: { id: todo.id },
      data: {
        ...(completed !== undefined ? { completed } : {}),
        ...(title !== undefined ? { title } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'タスクの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: any
) {
  const { params } = context;
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }
  try {
    // 自分のタスクか確認
    const todo = await prisma.todo.findUnique({ where: { id: parseInt(params.id) } });
    if (!todo || todo.userId !== token.sub) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }
    await prisma.todo.delete({ where: { id: todo.id } });
    return NextResponse.json({ message: 'タスクを削除しました' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'タスクの削除に失敗しました' }, { status: 500 });
  }
} 