import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type VariationSeed = {
  name: string;
  price: number;
};

type MenuItemSeed = {
  itemName: string;
  description: string;
  basePrice?: number;
  variations?: VariationSeed[];
  category: string;
};

type DealItemSeed = {
  itemName: string;
  quantity: number;
};

type DealSeed = {
  name: string;
  type: string;
  price: number;
  description: string;
  items: DealItemSeed[];
};

type BranchSeed = {
  requestedName: string;
  menu: MenuItemSeed[];
  deals: DealSeed[];
};

const CATEGORIES = [
  "BBQ & Grilled",
  "Chicken Entrées",
  "Burgers & Sandwiches",
  "Pizza",
  "Rice & Biryani",
  "Hot Beverages",
  "Cold Beverages",
  "Desserts",
  "Sides",
  "Deals Specials",
] as const;

const BRANCH_DATA: BranchSeed[] = [
  {
    requestedName: "Main Branch",
    menu: [
      {
        category: "BBQ & Grilled",
        itemName: "Chicken Tikka",
        basePrice: 650,
        description:
          "Traditional charcoal grilled chicken tikka with aromatic spices",
      },
      {
        category: "BBQ & Grilled",
        itemName: "Malai Boti",
        basePrice: 850,
        description: "Creamy grilled chicken cubes marinated in mild spices",
      },
      {
        category: "BBQ & Grilled",
        itemName: "Chicken Seekh Kebab",
        basePrice: 700,
        description: "Minced chicken kebabs grilled over open flame",
      },
      {
        category: "Chicken Entrées",
        itemName: "Chicken Karahi",
        variations: [
          { name: "Half KG", price: 1350 },
          { name: "Full KG", price: 2550 },
        ],
        description:
          "Traditional chicken karahi cooked with tomatoes and spices",
      },
      {
        category: "Chicken Entrées",
        itemName: "Chicken Handi",
        variations: [
          { name: "Half KG", price: 1450 },
          { name: "Full KG", price: 2700 },
        ],
        description: "Creamy chicken handi served with naan",
      },
      {
        category: "Burgers & Sandwiches",
        itemName: "Zinger Burger",
        basePrice: 590,
        description: "Crispy chicken fillet burger with lettuce and mayo",
      },
      {
        category: "Burgers & Sandwiches",
        itemName: "Club Sandwich",
        basePrice: 550,
        description:
          "Triple layered sandwich with chicken egg and vegetables",
      },
      {
        category: "Pizza",
        itemName: "Chicken Fajita Pizza",
        variations: [
          { name: "Small", price: 1200 },
          { name: "Medium", price: 1800 },
          { name: "Large", price: 2200 },
        ],
        description:
          "Pizza topped with fajita chicken onions and capsicum",
      },
      {
        category: "Pizza",
        itemName: "Malai Boti Pizza",
        variations: [
          { name: "Small", price: 1250 },
          { name: "Medium", price: 1850 },
          { name: "Large", price: 2300 },
        ],
        description: "Creamy malai boti pizza with cheese",
      },
      {
        category: "Rice & Biryani",
        itemName: "Chicken Biryani",
        basePrice: 450,
        description:
          "Fragrant basmati rice with layered spiced chicken",
      },
      {
        category: "Rice & Biryani",
        itemName: "Chicken Pulao",
        basePrice: 420,
        description: "Mildly spiced pulao rice with chicken pieces",
      },
      {
        category: "Hot Beverages",
        itemName: "Doodh Patti",
        variations: [
          { name: "Regular", price: 120 },
          { name: "Large", price: 180 },
        ],
        description: "Strong milk tea prepared in local style",
      },
      {
        category: "Hot Beverages",
        itemName: "Green Tea",
        basePrice: 140,
        description: "Light and refreshing green tea",
      },
      {
        category: "Cold Beverages",
        itemName: "Mint Margarita",
        basePrice: 320,
        description:
          "Chilled mint margarita with refreshing citrus flavor",
      },
      {
        category: "Cold Beverages",
        itemName: "Fresh Lemonade",
        basePrice: 250,
        description: "Fresh lemonade served chilled",
      },
      {
        category: "Desserts",
        itemName: "Gulab Jamun",
        basePrice: 220,
        description: "Soft warm gulab jamun served in sugar syrup",
      },
      {
        category: "Desserts",
        itemName: "Kheer",
        basePrice: 260,
        description:
          "Traditional rice pudding with cardamom and nuts",
      },
      {
        category: "Sides",
        itemName: "French Fries",
        variations: [
          { name: "Regular", price: 220 },
          { name: "Large", price: 350 },
        ],
        description: "Crispy golden fries with seasoning",
      },
      {
        category: "Sides",
        itemName: "Garlic Mayo Dip",
        basePrice: 80,
        description: "Creamy garlic mayo dip portion",
      },
    ],
    deals: [
      {
        name: "Family Deal",
        type: "Family Combo",
        price: 3499,
        description:
          "Perfect for a family gathering with BBQ favorites and refreshing drinks.",
        items: [
          { itemName: "Chicken Tikka", quantity: 2 },
          { itemName: "Chicken Seekh Kebab", quantity: 2 },
          { itemName: "Malai Boti", quantity: 1 },
          { itemName: "Mint Margarita", quantity: 2 },
        ],
      },
      {
        name: "Breakfast Special",
        type: "Morning Deal",
        price: 699,
        description: "Light breakfast combo with tea.",
        items: [
          { itemName: "Doodh Patti", quantity: 2 },
          { itemName: "French Fries", quantity: 1 },
          { itemName: "Club Sandwich", quantity: 1 },
        ],
      },
    ],
  },
  {
    requestedName: "Food Street Branch",
    menu: [
      {
        category: "BBQ & Grilled",
        itemName: "Chicken Tikka",
        basePrice: 680,
        description:
          "Traditional charcoal grilled chicken tikka with aromatic spices",
      },
      {
        category: "BBQ & Grilled",
        itemName: "Malai Boti",
        basePrice: 880,
        description: "Creamy grilled chicken cubes marinated in mild spices",
      },
      {
        category: "BBQ & Grilled",
        itemName: "Beef Bihari Boti",
        basePrice: 1100,
        description: "Tender beef boti with smoky bihari style flavor",
      },
      {
        category: "Chicken Entrées",
        itemName: "Chicken Karahi",
        variations: [
          { name: "Half KG", price: 1400 },
          { name: "Full KG", price: 2600 },
        ],
        description:
          "Traditional chicken karahi cooked with tomatoes and spices",
      },
      {
        category: "Chicken Entrées",
        itemName: "Butter Chicken",
        basePrice: 980,
        description: "Tender chicken cooked in rich buttery tomato gravy",
      },
      {
        category: "Burgers & Sandwiches",
        itemName: "Zinger Burger",
        basePrice: 620,
        description: "Crispy chicken fillet burger with lettuce and mayo",
      },
      {
        category: "Burgers & Sandwiches",
        itemName: "Grilled Chicken Sandwich",
        basePrice: 620,
        description:
          "Grilled chicken breast sandwich with fresh vegetables",
      },
      {
        category: "Pizza",
        itemName: "Chicken Fajita Pizza",
        variations: [
          { name: "Small", price: 1250 },
          { name: "Medium", price: 1850 },
          { name: "Large", price: 2250 },
        ],
        description:
          "Pizza topped with fajita chicken onions and capsicum",
      },
      {
        category: "Pizza",
        itemName: "Veggie Supreme Pizza",
        variations: [
          { name: "Small", price: 1100 },
          { name: "Medium", price: 1700 },
          { name: "Large", price: 2100 },
        ],
        description:
          "Loaded vegetable pizza with olives mushrooms and peppers",
      },
      {
        category: "Rice & Biryani",
        itemName: "Chicken Biryani",
        basePrice: 470,
        description:
          "Fragrant basmati rice with layered spiced chicken",
      },
      {
        category: "Rice & Biryani",
        itemName: "Beef Biryani",
        basePrice: 520,
        description: "Aromatic rice with tender beef and traditional masala",
      },
      {
        category: "Hot Beverages",
        itemName: "Doodh Patti",
        variations: [
          { name: "Regular", price: 130 },
          { name: "Large", price: 190 },
        ],
        description: "Strong milk tea prepared in local style",
      },
      {
        category: "Hot Beverages",
        itemName: "Cappuccino",
        basePrice: 320,
        description: "Freshly brewed cappuccino with milk foam",
      },
      {
        category: "Cold Beverages",
        itemName: "Mint Margarita",
        basePrice: 340,
        description:
          "Chilled mint margarita with refreshing citrus flavor",
      },
      {
        category: "Cold Beverages",
        itemName: "Cold Coffee",
        basePrice: 350,
        description: "Creamy cold coffee topped with ice",
      },
      {
        category: "Desserts",
        itemName: "Chocolate Lava Cake",
        basePrice: 480,
        description: "Warm chocolate cake with molten center",
      },
      {
        category: "Desserts",
        itemName: "Ice Cream Sundae",
        basePrice: 420,
        description:
          "Vanilla ice cream with chocolate syrup and nuts",
      },
      {
        category: "Sides",
        itemName: "Masala Fries",
        variations: [
          { name: "Regular", price: 250 },
          { name: "Large", price: 380 },
        ],
        description: "Fries tossed in spicy masala seasoning",
      },
      {
        category: "Sides",
        itemName: "Coleslaw Side",
        basePrice: 120,
        description: "Fresh creamy coleslaw side serving",
      },
    ],
    deals: [
      {
        name: "Street BBQ Combo",
        type: "Combo Deal",
        price: 1699,
        description:
          "Signature BBQ platter for one with grilled favorites.",
        items: [
          { itemName: "Chicken Tikka", quantity: 1 },
          { itemName: "Malai Boti", quantity: 1 },
          { itemName: "Beef Bihari Boti", quantity: 1 },
        ],
      },
      {
        name: "Hot Pizza Deal",
        type: "Limited Time",
        price: 1299,
        description: "Pizza combo with chilled drinks.",
        items: [
          { itemName: "Chicken Fajita Pizza", quantity: 1 },
          { itemName: "Mint Margarita", quantity: 2 },
        ],
      },
    ],
  },
  {
    requestedName: "Sufi-City Branch",
    menu: [
      {
        category: "BBQ & Grilled",
        itemName: "Chicken Tikka",
        basePrice: 660,
        description:
          "Traditional charcoal grilled chicken tikka with aromatic spices",
      },
      {
        category: "BBQ & Grilled",
        itemName: "Chicken Seekh Kebab",
        basePrice: 720,
        description: "Minced chicken kebabs grilled over open flame",
      },
      {
        category: "BBQ & Grilled",
        itemName: "Malai Boti",
        basePrice: 860,
        description: "Creamy grilled chicken cubes marinated in mild spices",
      },
      {
        category: "Chicken Entrées",
        itemName: "Chicken Handi",
        variations: [
          { name: "Half KG", price: 1480 },
          { name: "Full KG", price: 2750 },
        ],
        description: "Creamy chicken handi served with naan",
      },
      {
        category: "Chicken Entrées",
        itemName: "Chicken Jalfrezi",
        basePrice: 920,
        description:
          "Boneless chicken tossed with vegetables and spices",
      },
      {
        category: "Burgers & Sandwiches",
        itemName: "Beef Cheese Burger",
        basePrice: 690,
        description:
          "Juicy beef burger topped with cheese and house sauce",
      },
      {
        category: "Burgers & Sandwiches",
        itemName: "Club Sandwich",
        basePrice: 570,
        description:
          "Triple layered sandwich with chicken egg and vegetables",
      },
      {
        category: "Pizza",
        itemName: "Malai Boti Pizza",
        variations: [
          { name: "Small", price: 1280 },
          { name: "Medium", price: 1880 },
          { name: "Large", price: 2320 },
        ],
        description: "Creamy malai boti pizza with cheese",
      },
      {
        category: "Pizza",
        itemName: "Pepperoni Pizza",
        variations: [
          { name: "Small", price: 1350 },
          { name: "Medium", price: 1950 },
          { name: "Large", price: 2400 },
        ],
        description: "Classic pepperoni pizza with mozzarella cheese",
      },
      {
        category: "Rice & Biryani",
        itemName: "Chicken Biryani",
        basePrice: 460,
        description:
          "Fragrant basmati rice with layered spiced chicken",
      },
      {
        category: "Rice & Biryani",
        itemName: "Fried Rice",
        basePrice: 480,
        description: "Stir fried rice with vegetables and chicken",
      },
      {
        category: "Hot Beverages",
        itemName: "Doodh Patti",
        variations: [
          { name: "Regular", price: 120 },
          { name: "Large", price: 180 },
        ],
        description: "Strong milk tea prepared in local style",
      },
      {
        category: "Hot Beverages",
        itemName: "Hot Chocolate",
        basePrice: 360,
        description: "Rich creamy hot chocolate",
      },
      {
        category: "Cold Beverages",
        itemName: "Fresh Lemonade",
        basePrice: 260,
        description: "Fresh lemonade served chilled",
      },
      {
        category: "Cold Beverages",
        itemName: "Iced Tea",
        basePrice: 280,
        description: "Cold brewed tea with lemon and ice",
      },
      {
        category: "Desserts",
        itemName: "Gulab Jamun",
        basePrice: 220,
        description: "Soft warm gulab jamun served in sugar syrup",
      },
      {
        category: "Desserts",
        itemName: "Kheer",
        basePrice: 260,
        description:
          "Traditional rice pudding with cardamom and nuts",
      },
      {
        category: "Sides",
        itemName: "French Fries",
        variations: [
          { name: "Regular", price: 220 },
          { name: "Large", price: 350 },
        ],
        description: "Crispy golden fries with seasoning",
      },
      {
        category: "Sides",
        itemName: "Garlic Mayo Dip",
        basePrice: 80,
        description: "Creamy garlic mayo dip portion",
      },
    ],
    deals: [
      {
        name: "Student Deal",
        type: "Student Offer",
        price: 599,
        description: "Budget-friendly combo deal for students.",
        items: [
          { itemName: "Club Sandwich", quantity: 1 },
          { itemName: "French Fries", quantity: 1 },
          { itemName: "Fresh Lemonade", quantity: 1 },
        ],
      },
      {
        name: "Tea Time Deal",
        type: "Evening Combo",
        price: 499,
        description: "Tea-time combo with snacks and dessert.",
        items: [
          { itemName: "Doodh Patti", quantity: 2 },
          { itemName: "Garlic Mayo Dip", quantity: 1 },
          { itemName: "Gulab Jamun", quantity: 2 },
        ],
      },
    ],
  },
];

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function includesLoose(haystack: string, needle: string) {
  return norm(haystack).includes(norm(needle));
}

function menuPrice(item: MenuItemSeed) {
  if (item.variations?.length) {
    return Math.min(...item.variations.map((v) => v.price));
  }
  return item.basePrice ?? 0;
}

async function upsertCategory(branchId: number, name: string) {
  const existing = await prisma.category.findFirst({
    where: { branch_id: branchId, name },
    select: { category_id: true },
  });
  if (existing) return { categoryId: existing.category_id, created: false };

  const created = await prisma.category.create({
    data: {
      name,
      description: null,
      branch_id: branchId,
      kid: 0,
      terminal: 1,
    },
    select: { category_id: true },
  });
  return { categoryId: created.category_id, created: true };
}

async function upsertMenu(branchId: number, item: MenuItemSeed) {
  const existing = await prisma.menu.findFirst({
    where: {
      branchId,
      category: item.category,
      itemName: item.itemName,
    },
    select: { id: true },
  });

  const payload = {
    itemName: item.itemName,
    description: item.description,
    branchId,
    category: item.category,
    hasVariations: !!item.variations?.length,
    basePrice: item.variations?.length ? null : new Prisma.Decimal(item.basePrice ?? 0),
    price: new Prisma.Decimal(menuPrice(item)),
    status: "ACTIVE" as const,
  };

  if (existing) {
    const updated = await prisma.menu.update({
      where: { id: existing.id },
      data: payload,
      select: { id: true },
    });
    return { menuId: updated.id, created: false };
  }

  const created = await prisma.menu.create({
    data: payload,
    select: { id: true },
  });
  return { menuId: created.id, created: true };
}

async function syncVariations(menuId: number, item: MenuItemSeed) {
  await prisma.menuVariation.deleteMany({ where: { menuId } });
  const variations = item.variations ?? [];
  if (!variations.length) return 0;
  await prisma.menuVariation.createMany({
    data: variations.map((v, i) => ({
      menuId,
      name: v.name,
      price: new Prisma.Decimal(v.price),
      sortOrder: i,
    })),
  });
  return variations.length;
}

async function ensureDishFromMenu(branchId: number, menuId: number) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    select: { id: true, itemName: true, category: true, price: true, branchId: true },
  });
  if (!menu || menu.branchId !== branchId) return null;

  const existingDish = await prisma.menuItem.findFirst({
    where: { branch_id: branchId, name: menu.itemName },
    select: { dish_id: true },
  });
  if (existingDish) return existingDish.dish_id;

  const category = await prisma.category.findFirst({
    where: { branch_id: branchId, name: menu.category },
    select: { category_id: true },
  });
  if (!category) return null;

  const created = await prisma.menuItem.create({
    data: {
      name: menu.itemName,
      description: null,
      price: menu.price,
      qnty: 0,
      barcode: null,
      is_available: 1,
      is_frequent: 0,
      discount: new Prisma.Decimal(0),
      category_id: category.category_id,
      terminal: 1,
      branch_id: branchId,
      status: "ACTIVE",
    },
    select: { dish_id: true },
  });
  return created.dish_id;
}

async function upsertDeal(
  branchId: number,
  deal: DealSeed,
  menuMap: Map<string, number>
) {
  const dealExisting = await prisma.deal.findFirst({
    where: { branch_id: branchId, name: deal.name },
    select: { id: true },
  });

  const dealId = await prisma.$transaction(async (tx) => {
    const baseDeal = dealExisting
      ? await tx.deal.update({
          where: { id: dealExisting.id },
          data: {
            branch_id: branchId,
            name: deal.name,
            description: deal.description,
            status: "Active",
            discount_type: deal.type,
            discount_value: new Prisma.Decimal(deal.price),
          },
          select: { id: true },
        })
      : await tx.deal.create({
          data: {
            branch_id: branchId,
            name: deal.name,
            description: deal.description,
            status: "Active",
            discount_type: deal.type,
            discount_value: new Prisma.Decimal(deal.price),
          },
          select: { id: true },
        });

    await tx.dealItem.deleteMany({ where: { deal_id: baseDeal.id } });

    for (const item of deal.items) {
      const menuId = menuMap.get(norm(item.itemName));
      if (!menuId) continue;
      const dishId = await ensureDishFromMenu(branchId, menuId);
      if (!dishId) continue;
      await tx.dealItem.create({
        data: {
          deal_id: baseDeal.id,
          dish_id: dishId,
          quantity: item.quantity,
        },
      });
    }

    return baseDeal.id;
  });

  const itemCount = await prisma.dealItem.count({ where: { deal_id: dealId } });
  return { created: !dealExisting, itemCount };
}

async function main() {
  console.log("Seeding Chai-khas multi-branch demo data...");

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [
        { name: { equals: "Chai-khas", mode: "insensitive" } },
        { name: { equals: "Chai khas", mode: "insensitive" } },
        { slug: { contains: "chai", mode: "insensitive" } },
      ],
    },
    select: { restaurant_id: true, name: true, slug: true },
  });

  if (!restaurant) {
    throw new Error('Restaurant "Chai-khas" not found.');
  }

  const allBranches = await prisma.branch.findMany({
    where: { restaurant_id: restaurant.restaurant_id },
    select: { branch_id: true, branch_name: true, status: true },
  });
  if (!allBranches.length) {
    throw new Error(`No branches found for restaurant "${restaurant.name}".`);
  }

  const summary = {
    categoriesCreated: 0,
    categoriesReused: 0,
    menuCreated: 0,
    menuUpdated: 0,
    variationsCreated: 0,
    dealsCreated: 0,
    dealsUpdated: 0,
    dealsByBranch: new Map<string, number>(),
    menuByBranch: new Map<string, number>(),
    categoriesByBranch: new Map<string, number>(),
  };

  for (const branchSeed of BRANCH_DATA) {
    const branch = allBranches.find(
      (b) =>
        includesLoose(b.branch_name, branchSeed.requestedName) ||
        includesLoose(branchSeed.requestedName, b.branch_name)
    );
    if (!branch) {
      throw new Error(`Branch not found/matched: ${branchSeed.requestedName}`);
    }

    console.log(`\nBranch: ${branch.branch_name}`);

    for (const category of CATEGORIES) {
      const res = await upsertCategory(branch.branch_id, category);
      if (res.created) summary.categoriesCreated += 1;
      else summary.categoriesReused += 1;
    }
    summary.categoriesByBranch.set(branch.branch_name, CATEGORIES.length);

    const menuMap = new Map<string, number>();
    let branchMenuCount = 0;
    for (const item of branchSeed.menu) {
      const menuRes = await upsertMenu(branch.branch_id, item);
      const varsCreated = await syncVariations(menuRes.menuId, item);
      summary.variationsCreated += varsCreated;
      if (menuRes.created) summary.menuCreated += 1;
      else summary.menuUpdated += 1;
      branchMenuCount += 1;
      menuMap.set(norm(item.itemName), menuRes.menuId);
    }
    summary.menuByBranch.set(branch.branch_name, branchMenuCount);

    let branchDealsCount = 0;
    for (const deal of branchSeed.deals) {
      const dealRes = await upsertDeal(branch.branch_id, deal, menuMap);
      if (dealRes.created) summary.dealsCreated += 1;
      else summary.dealsUpdated += 1;
      branchDealsCount += 1;
      console.log(
        `  ${dealRes.created ? "Created" : "Updated"} deal: ${deal.name} (${dealRes.itemCount} items)`
      );
    }
    summary.dealsByBranch.set(branch.branch_name, branchDealsCount);
  }

  console.log("\nSeed completed.");
  console.log(`Categories created: ${summary.categoriesCreated}`);
  console.log(`Categories reused: ${summary.categoriesReused}`);
  console.log(`Menu items created: ${summary.menuCreated}`);
  console.log(`Menu items updated: ${summary.menuUpdated}`);
  console.log(`Variation rows created: ${summary.variationsCreated}`);
  console.log(`Deals created: ${summary.dealsCreated}`);
  console.log(`Deals updated: ${summary.dealsUpdated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
