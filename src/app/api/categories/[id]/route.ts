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
  const { name, slug, icon, importantNotes, commonMistakes, attentionPoints } = body;

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Название и slug обязательны" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slug.trim(),
      icon: icon?.trim() || null,
      importantNotes: importantNotes ? JSON.stringify(importantNotes) : null,
      commonMistakes: commonMistakes ? JSON.stringify(commonMistakes) : null,
      attentionPoints: attentionPoints ? JSON.stringify(attentionPoints) : null,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
