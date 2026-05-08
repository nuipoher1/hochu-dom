import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Все партнёры из каталога
const partners = [
  {
    name: "АИИП (Агентство инвентаризации и проектирования)",
    description:
      "Агентство инвентаризации и проектирования: межевание, кадастровые работы, геологические исследования, архитектурное проектирование и юридическое сопровождение сделок с землёй.",
    phone: "+7 (910) 900-28-28, +7 (4912) 50-28-28",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: [
      "mezhevanie-kadastr",
      "geologiya",
      "arhitektura",
      "yuridicheskoe-soprovozhdenie-sdelki",
    ],
  },
  {
    name: "Агентство недвижимости «Свои Люди»",
    description:
      "Подбор, оценка и сопровождение сделок с загородной недвижимостью. Помощь в поиске участков и готовых домов в Рязани и Рязанской области.",
    phone: "+7 953 743 05 45",
    website: "https://svoi-rzn.ru",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["rieltor"],
  },
  {
    name: "Биг Хаус",
    description:
      "Строительство домов под ключ. Генеральный подряд, полный цикл строительных работ.",
    phone: "+7 (4912) 99-50-58, +7 (920) 977-77-49",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["stroitelnye-kompanii"],
  },
  {
    name: "Двери Нева",
    description:
      "Входные и межкомнатные двери. Широкий выбор, установка и отделка дверных проёмов.",
    website: "https://dverineva-ryazan.ru",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["dveri"],
  },
  {
    name: "Ковка на заказ",
    description:
      "«Ковка на заказ» — производственная компания, проектирует и изготавливает металлические изделия под конкретный объект. Перила, ворота, калитки, заборы, козырьки, навесы, решётки, лестничные ограждения, мебель и декор из металла. Полный цикл: консультация, замер, проектирование, 3D-визуализация, изготовление, покраска, доставка и монтаж.",
    phone: "+7 495 666-56-37",
    email: "kovka@kovka-na-zakaz.ru",
    website: "https://kovka-na-zakaz.ru",
    instagram: "https://www.instagram.com/kovkanazakaz/",
    vk: "https://vk.ru/kovkanazakaz",
    telegram: "https://t.me/kovka_na_zakaz",
    address: "г. Рязань, ул. Связи, дом 29с7",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["zabory", "vorota"],
  },
  {
    name: "Ремонт в срок",
    description:
      "Комплексный ремонт квартир и домов. Малярные, электромонтажные и сантехнические работы.",
    phone: "+7 920 631 76 31",
    website: "https://remontvsrok62.clients.site",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["malyarnye-raboty", "elektromontazh", "santehnika"],
  },
  {
    name: "Кухни Трио",
    description:
      "Кухонные гарнитуры, корпусная мебель и шкафы-купе на заказ по индивидуальным размерам.",
    website: "https://кухни-трио.рф",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["kuhni", "korpusnaya-mebel", "shkafy-garderobny"],
  },
  {
    name: "Уваров (жалюзи и рулонные шторы)",
    description:
      "Жалюзи, рулонные шторы и другие текстильные решения для дома под заказ. Замер, изготовление и монтаж.",
    phone: "+7 (4912) 20-29-40, +7 (993) 561-66-16",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["dekor-tekstil"],
  },
  {
    name: "Печных дел мастер",
    description:
      "Изготовление и установка печей, каминов, хлебных и банных печей под заказ. Кладка кирпичных и облицовочных конструкций, декоративные и функциональные решения для частных домов.",
    phone: "+7 910 500-79-97",
    isFestivalPartner: true,
    isSpeaker: false,
    subcategorySlugs: ["kaminy"],
  },
];

async function main() {
  console.log("🚀 Добавляем партнёров в базу данных...\n");

  // Загружаем все подкатегории из БД
  const allSubcategories = await prisma.subcategory.findMany();
  const subBySlug = Object.fromEntries(allSubcategories.map((s) => [s.slug, s]));

  for (const p of partners) {
    const { subcategorySlugs, ...data } = p;

    // Проверяем, что все подкатегории существуют
    const validSubs = subcategorySlugs.filter((slug) => {
      if (!subBySlug[slug]) {
        console.warn(`  ⚠️  Подкатегория не найдена: ${slug}`);
        return false;
      }
      return true;
    });

    // Создаём или обновляем подрядчика
    const existing = await prisma.contractor.findFirst({ where: { name: data.name } });
    let contractor;
    if (existing) {
      contractor = await prisma.contractor.update({ where: { id: existing.id }, data });
    } else {
      contractor = await prisma.contractor.create({ data });
    }

    // Удаляем старые связи с подкатегориями и создаём новые
    await prisma.contractorSubcategory.deleteMany({
      where: { contractorId: contractor.id },
    });

    for (const slug of validSubs) {
      await prisma.contractorSubcategory.create({
        data: {
          contractorId: contractor.id,
          subcategoryId: subBySlug[slug].id,
        },
      });
    }

    const subNames = validSubs.map((s) => subBySlug[s]?.name).join(", ");
    console.log(`✅ ${contractor.name}`);
    console.log(`   Подкатегории: ${subNames}\n`);
  }

  console.log(`🎉 Готово! Добавлено ${partners.length} партнёров.`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
