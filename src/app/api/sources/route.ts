import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sources = await prisma.fundingSource.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(sources.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json() as { name: string };
  const source = await prisma.fundingSource.create({
    data: { name, userId: session.user.id },
  });
  return NextResponse.json({ id: source.id, name: source.name }, { status: 201 });
}
