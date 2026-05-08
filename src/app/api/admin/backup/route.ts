import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [categories, contractors] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        subcategories: { orderBy: { order: "asc" } },
        tips: { orderBy: { order: "asc" } },
      },
    }),
    prisma.contractor.findMany({
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          include: { subcategory: true },
        },
      },
    }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: 1,
    categories,
    contractors,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
