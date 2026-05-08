import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categoryId = parseInt(params.id);
  if (isNaN(categoryId)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  const body = await req.json();
  const { name, slug } = body;

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Название и slug обязательны" }, { status: 400 });
  }

  const existing = await prisma.subcategory.findFirst({
    where: { slug: slug.trim(), categoryId },
  });
  if (existing) {
    return NextResponse.json({ error: "Такой slug уже существует в этой категории" }, { status: 400 });
  }

  const subcategory = await prisma.subcategory.create({
    data: { name: name.trim(), slug: slug.trim(), categoryId },
  });

  return NextResponse.json(subcategory, { status: 201 });
}
