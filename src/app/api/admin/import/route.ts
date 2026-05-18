import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });

    // Загружаем все подкатегории для маппинга по имени
    const allSubs = await prisma.subcategory.findMany({ select: { id: true, name: true } });
    const subByName = new Map(allSubs.map((s) => [s.name.trim().toLowerCase(), s.id]));

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const name = (row["Название"] || "").trim();
      if (!name) continue;

      // Маппинг подкатегорий
      const subNames = (row["Услуга"] || "")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      const subcategoryIds: number[] = [];
      for (const subName of subNames) {
        const id = subByName.get(subName.toLowerCase());
        if (id) subcategoryIds.push(id);
        else errors.push(`Строка «${name}»: подкатегория «${subName}» не найдена — пропущена`);
      }

      // География — несколько через ;
      const geoArr = (row["География"] || "").split(";").map((s) => s.trim()).filter(Boolean);
      const geography = geoArr.length ? JSON.stringify(geoArr) : null;

      const data = {
        description: (row["Описание"] || "").trim() || null,
        address: (row["Адрес"] || "").trim() || null,
        phone: (row["Телефон"] || "").trim() || null,
        email: (row["Email"] || "").trim() || null,
        website: (row["Сайт"] || "").trim() || null,
        instagram: (row["Instagram"] || "").trim() || null,
        vk: (row["VK"] || "").trim() || null,
        telegram: (row["Telegram"] || "").trim() || null,
        whatsapp: (row["Макс"] || "").trim() || null,
        geography,
        isFestivalPartner: (row["Участник фестиваля"] || "").trim().toLowerCase() === "да",
        isSpeaker: (row["Спикер"] || "").trim().toLowerCase() === "да",
        speakerTopic: (row["Тема выступления"] || "").trim() || null,
      };

      const existing = await prisma.contractor.findFirst({ where: { name } });

      if (existing) {
        await prisma.contractor.update({ where: { id: existing.id }, data });
        // Обновляем подкатегории
        await prisma.contractorSubcategory.deleteMany({ where: { contractorId: existing.id } });
        if (subcategoryIds.length) {
          await prisma.contractorSubcategory.createMany({
            data: [...new Set(subcategoryIds)].map((sid) => ({ contractorId: existing.id, subcategoryId: sid })),
            skipDuplicates: true,
          });
        }
        updated++;
      } else {
        const contractor = await prisma.contractor.create({ data: { name, ...data } });
        if (subcategoryIds.length) {
          await prisma.contractorSubcategory.createMany({
            data: [...new Set(subcategoryIds)].map((sid) => ({ contractorId: contractor.id, subcategoryId: sid })),
            skipDuplicates: true,
          });
        }
        created++;
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка при обработке файла" }, { status: 500 });
  }
}
