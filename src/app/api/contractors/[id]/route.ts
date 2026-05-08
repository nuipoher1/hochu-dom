import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  const contractor = await prisma.contractor.findUnique({
    where: { id },
    include: {
      subcategories: { include: { subcategory: { include: { category: true } } } },
    },
  });

  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contractor);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  const body = await req.json();
  console.log("[PUT contractor] body:", JSON.stringify(body, null, 2));

  const {
    name, description, phone, email, website,
    instagram, vk, telegram, address, geography,
    isFestivalPartner, isSpeaker, speakerTopic, speakerLectureUrl,
    subcategoryIds,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const parsedSubIds: number[] = (subcategoryIds || [])
    .map((sid: unknown) => parseInt(String(sid)))
    .filter((n: number) => !isNaN(n));

  console.log("[PUT contractor] id:", id, "parsedSubIds:", parsedSubIds);

  try {
    // Step 1: delete old subcategory links
    console.log("[PUT contractor] deleting subcategories...");
    await prisma.contractorSubcategory.deleteMany({ where: { contractorId: id } });

    // Step 2: update contractor fields
    console.log("[PUT contractor] updating contractor...");
    const contractor = await prisma.contractor.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        instagram: instagram?.trim() || null,
        vk: vk?.trim() || null,
        telegram: telegram?.trim() || null,
        address: address?.trim() || null,
        geography: Array.isArray(geography) && geography.length > 0
          ? JSON.stringify(geography)
          : null,
        isFestivalPartner: Boolean(isFestivalPartner),
        isSpeaker: Boolean(isSpeaker),
        speakerTopic: speakerTopic?.trim() || null,
        speakerLectureUrl: speakerLectureUrl?.trim() || null,
      },
    });

    // Step 3: create new subcategory links
    if (parsedSubIds.length > 0) {
      console.log("[PUT contractor] creating subcategory links:", parsedSubIds);
      await prisma.contractorSubcategory.createMany({
        data: parsedSubIds.map((subcategoryId) => ({ contractorId: id, subcategoryId })),
      });
    }

    console.log("[PUT contractor] done");
    return NextResponse.json(contractor);
  } catch (err: unknown) {
    console.error("[PUT contractor] ERROR:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

  await prisma.contractor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
