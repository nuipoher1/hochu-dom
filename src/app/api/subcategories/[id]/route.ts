import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  const body = await req.json();
  const { name, slug } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const subcategory = await prisma.subcategory.update({
    where: { id },
    data: { name: name.trim(), ...(slug?.trim() ? { slug: slug.trim() } : {}) },
  });

  return NextResponse.json(subcategory);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  await prisma.subcategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
