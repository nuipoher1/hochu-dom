import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { subcategories: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, icon, importantNotes, commonMistakes, attentionPoints } = body;

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Название и slug обязательны" }, { status: 400 });
  }

  // Get max order
  const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
  const order = (last?.order ?? 0) + 1;

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      icon: icon?.trim() || null,
      order,
      importantNotes: importantNotes ? JSON.stringify(importantNotes) : null,
      commonMistakes: commonMistakes ? JSON.stringify(commonMistakes) : null,
      attentionPoints: attentionPoints ? JSON.stringify(attentionPoints) : null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
