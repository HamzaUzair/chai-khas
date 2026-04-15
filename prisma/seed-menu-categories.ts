import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_MENU_CATEGORIES = [
  "Starters",
  "Soups",
  "Salads",
  "Fast Food",
  "Burgers & Sandwiches",
  "Pizza",
  "Pasta",
  "Rice & Biryani",
  "BBQ & Grilled",
  "Chicken Entrées",
  "Beef Entrées",
  "Seafood",
  "Vegetarian",
  "Sides",
  "Breakfast",
  "Desserts",
  "Hot Beverages",
  "Cold Beverages",
  "Soft Drinks",
  "Chef’s Specials",
];

async function main() {
  console.log("Seeding default menu categories...");

  const branches = await prisma.branch.findMany({
    where: { status: "Active" },
    select: { branch_id: true, branch_name: true },
  });

  if (branches.length === 0) {
    console.log("No active branches found. Create a branch first.");
    return;
  }

  for (const branch of branches) {
    let createdCount = 0;
    for (const name of DEFAULT_MENU_CATEGORIES) {
      const existing = await prisma.category.findFirst({
        where: {
          branch_id: branch.branch_id,
          name,
        },
        select: { category_id: true },
      });
      if (existing) continue;

      await prisma.category.create({
        data: {
          name,
          description: null,
          branch_id: branch.branch_id,
          kid: 0,
          terminal: 1,
        },
      });
      createdCount += 1;
    }

    console.log(
      `Branch "${branch.branch_name}": ${createdCount} new categories added`
    );
  }

  console.log("Menu categories seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

