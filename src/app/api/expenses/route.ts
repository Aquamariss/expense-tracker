import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, category, date, description } = await req.json() as {
    amount: number;
    category: string;
    date: string;
    description?: string;
  };

  const expense = await prisma.expense.create({
    data: {
      amount,
      category,
      date,
      description: description ?? "",
      userId: session.user.id,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
