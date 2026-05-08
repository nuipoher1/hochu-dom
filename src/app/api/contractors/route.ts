import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const contractors = await prisma.contractor.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: [{ isFestivalPartner: "desc" }, { name: "asc" }],
    include: {
      subcategories: { include: { subcategory: { include: { category: true } } } },
    },
  });

  return NextResponse.json(contractors);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, description, phone, email, website,
    instagram, vk, telegram, address, geography,
    isFestivalPartner, isSpeaker, speakerTopic, speakerLectureUrl,
    subcategoryIds,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const contractor = await prisma.contractor.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      website: website?.trim() || null,
      instagram: instagram?.trim() || null,
      vk: vk?.trim() || null,
      telegram: telegram?.trim() || null,
      geography: Array.isArray(geography) && geography.length > 0 ? JSON.stringify(geography) : null,
      address: address?.trim() || null,
      isFestivalPartner: Boolean(isFestivalPartner),
      isSpeaker: Boolean(isSpeaker),
      speakerTopic: speakerTopic?.trim() || null,
      speakerLectureUrl: speakerLectureUrl?.trim() || null,
      subcategories: {
        create: (subcategoryIds || [])
          .map((sid: unknown) => parseInt(String(sid)))
          .filter((n: number) => !isNaN(n))
          .map((subcategoryId: number) => ({ subcategoryId })),
      },
    },
  });

  return NextResponse.json(contractor, { status: 201 });
}
