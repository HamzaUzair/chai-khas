import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedDealItem = {
  requestedName: string;
  quantity: number;
  fallbackNames?: string[];
};

type SeedDeal = {
  name: string;
  type: string;
  branchName: string;
  price: number;
  description: string;
  status: "Active" | "Draft";
  items: SeedDealItem[];
};

const SAMPLE_DEALS: SeedDeal[] = [
  {
    name: "Family Deal",
    type: "Family Combo",
    branchName: "Food Street",
    price: 3499,
    description:
      "Perfect for a family gathering with BBQ favorites and refreshing drinks.",
    status: "Active",
    items: [
      { requestedName: "Chicken Tikka", quantity: 2 },
      {
        requestedName: "Chicken Seekh Kebab",
        quantity: 2,
        fallbackNames: ["Seekh Kabab", "Seekh Kebab"],
      },
      { requestedName: "Malai Boti", quantity: 1 },
      {
        requestedName: "Soft Drink",
        quantity: 1,
        fallbackNames: ["Coca Cola", "Sprite", "Fanta", "Drink"],
      },
    ],
  },
  {
    name: "Hot Deal",
    type: "Limited Time",
    branchName: "Main Branch",
    price: 1299,
    description: "Spicy pizza combo with chilled drinks for a quick meal.",
    status: "Draft",
    items: [
      {
        requestedName: "Chicken Fajita Pizza",
        quantity: 1,
        fallbackNames: ["Pizza"],
      },
      {
        requestedName: "Soft Drink",
        quantity: 2,
        fallbackNames: ["Coca Cola", "Sprite", "Fanta", "Drink"],
      },
    ],
  },
  {
    name: "Student Deal",
    type: "Student Offer",
    branchName: "Sufi-City Branch",
    price: 599,
    description: "Budget-friendly combo deal for students.",
    status: "Active",
    items: [
      { requestedName: "Zinger Burger", quantity: 1 },
      {
        requestedName: "French Fries",
        quantity: 1,
        fallbackNames: ["Fries"],
      },
      {
        requestedName: "Soft Drink",
        quantity: 1,
        fallbackNames: ["Coca Cola", "Sprite", "Fanta", "Drink"],
      },
    ],
  },
  {
    name: "BBQ Combo",
    type: "Combo Deal",
    branchName: "Food Street",
    price: 1599,
    description:
      "Signature BBQ platter for one with classic grilled favorites.",
    status: "Active",
    items: [
      { requestedName: "Malai Boti", quantity: 1 },
      { requestedName: "Chicken Tikka", quantity: 1 },
      {
        requestedName: "Chicken Seekh Kebab",
        quantity: 1,
        fallbackNames: ["Seekh Kabab", "Seekh Kebab"],
      },
    ],
  },
  {
    name: "Breakfast Deal",
    type: "Breakfast Combo",
    branchName: "Main Branch",
    price: 699,
    description: "A complete desi breakfast combo with tea.",
    status: "Active",
    items: [
      { requestedName: "Halwa Puri", quantity: 1 },
      { requestedName: "Desi Omelette", quantity: 1 },
      {
        requestedName: "Doodh Patti",
        quantity: 1,
        fallbackNames: ["Tea", "Chai"],
      },
    ],
  },
];

function includesInsensitive(text: string, pattern: string) {
  return text.toLowerCase().includes(pattern.toLowerCase());
}

async function resolveMenuForDealItem(
  branchId: number,
  item: SeedDealItem
) {
  const activeMenu = await prisma.menu.findMany({
    where: {
      branchId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      itemName: true,
      category: true,
      price: true,
    },
  });

  const preferredNames = [item.requestedName, ...(item.fallbackNames ?? [])];

  for (const name of preferredNames) {
    const exact = activeMenu.find(
      (m) => m.itemName.toLowerCase() === name.toLowerCase()
    );
    if (exact) return exact;
  }

  for (const name of preferredNames) {
    const partial = activeMenu.find((m) =>
      includesInsensitive(m.itemName, name)
    );
    if (partial) return partial;
  }

  return null;
}

async function ensureDishForMenu(branchId: number, menuId: number) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    select: {
      itemName: true,
      category: true,
      price: true,
      branchId: true,
    },
  });
  if (!menu || menu.branchId !== branchId) return null;

  const existingDish = await prisma.menuItem.findFirst({
    where: {
      branch_id: branchId,
      name: menu.itemName,
    },
    select: { dish_id: true, name: true },
  });
  if (existingDish) return existingDish;

  const category = await prisma.category.findFirst({
    where: {
      branch_id: branchId,
      name: menu.category,
    },
    select: { category_id: true },
  });
  if (!category) return null;

  return prisma.menuItem.create({
    data: {
      name: menu.itemName,
      category_id: category.category_id,
      branch_id: branchId,
      price: menu.price,
      is_available: 1,
      status: "ACTIVE",
    },
    select: { dish_id: true, name: true },
  });
}

async function upsertDeal(seed: SeedDeal) {
  const branch = await prisma.branch.findFirst({
    where: {
      branch_name: seed.branchName,
      status: "Active",
    },
    select: { branch_id: true, branch_name: true },
  });
  if (!branch) {
    console.log(`Skipped "${seed.name}" - branch not found: ${seed.branchName}`);
    return;
  }

  const resolvedItems: Array<{ dishId: number; quantity: number; name: string }> = [];

  for (const item of seed.items) {
    const menu = await resolveMenuForDealItem(branch.branch_id, item);
    if (!menu) {
      console.log(
        `  - "${seed.name}" missing item mapping for: ${item.requestedName}`
      );
      continue;
    }

    const dish = await ensureDishForMenu(branch.branch_id, menu.id);
    if (!dish) {
      console.log(
        `  - "${seed.name}" failed to create/find dish for: ${menu.itemName}`
      );
      continue;
    }

    resolvedItems.push({
      dishId: dish.dish_id,
      quantity: item.quantity,
      name: dish.name,
    });
  }

  if (resolvedItems.length === 0) {
    console.log(`Skipped "${seed.name}" - no items resolved`);
    return;
  }

  const existing = await prisma.deal.findFirst({
    where: {
      branch_id: branch.branch_id,
      name: seed.name,
    },
    select: { id: true },
  });

  const dealId = await prisma.$transaction(async (tx) => {
    const deal = existing
      ? await tx.deal.update({
          where: { id: existing.id },
          data: {
            description: seed.description,
            status: seed.status,
            discount_type: seed.type,
            discount_value: seed.price,
          },
          select: { id: true },
        })
      : await tx.deal.create({
          data: {
            branch_id: branch.branch_id,
            name: seed.name,
            description: seed.description,
            status: seed.status,
            discount_type: seed.type,
            discount_value: seed.price,
          },
          select: { id: true },
        });

    await tx.dealItem.deleteMany({ where: { deal_id: deal.id } });

    for (const item of resolvedItems) {
      await tx.dealItem.create({
        data: {
          deal_id: deal.id,
          dish_id: item.dishId,
          quantity: item.quantity,
        },
      });
    }

    return deal.id;
  });

  console.log(
    `${existing ? "Updated" : "Created"} "${seed.name}" on "${branch.branch_name}" with ${resolvedItems.length} items`
  );
}

async function main() {
  console.log("Seeding sample deals...");
  for (const deal of SAMPLE_DEALS) {
    await upsertDeal(deal);
  }

  const totalDeals = await prisma.deal.count();
  const totalDealItems = await prisma.dealItem.count();
  console.log(`Done. totals => deals: ${totalDeals}, deal_items: ${totalDealItems}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

