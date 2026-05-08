import { prisma } from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      subcategories: { orderBy: { name: "asc" } },
    },
  });

  // Count contractors per category via subcategories
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const contractorCount = await prisma.contractorSubcategory.count({
        where: { subcategory: { categoryId: cat.id } },
      });
      return { ...cat, contractorCount };
    })
  );

  return <CategoriesClient initialCategories={categoriesWithCount} />;
}
