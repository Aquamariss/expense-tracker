import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await prisma.fundingSource.findUnique({ where: { id } });
  if (!source || source.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name } = await req.json() as { name: string };
  const oldName = source.name;

  await prisma.$transaction([
    prisma.fundingSource.update({ where: { id }, data: { name } }),
    prisma.expense.updateMany({
      where: { userId: session.user.id, source: oldName },
      data: { source: name },
    }),
  ]);

  return NextResponse.json({ id, name });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await prisma.fundingSource.findUnique({ where: { id } });
  if (!source || source.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expenseCount = await prisma.expense.count({
    where: { userId: session.user.id, source: source.name },
  });
  if (expenseCount > 0) {
    return NextResponse.json({ error: "Source has expenses" }, { status: 400 });
  }

  await prisma.fundingSource.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
