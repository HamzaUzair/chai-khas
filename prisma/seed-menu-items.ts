import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type VariationSeed = {
  name: string;
  price: number;
};

type MenuItemSeed = {
  itemName: string;
  description: string;
  hasVariations: boolean;
  basePrice?: number;
  variations?: VariationSeed[];
};

type CategorySeed = {
  category: string;
  items: MenuItemSeed[];
};

const MENU_DATA: CategorySeed[] = [
  {
    category: "BBQ & Grilled",
    items: [
      {
        itemName: "Chicken Tikka",
        description:
          "Traditional charcoal grilled chicken tikka with aromatic spices",
        hasVariations: false,
        basePrice: 650,
      },
      {
        itemName: "Malai Boti",
        description: "Creamy grilled chicken cubes marinated in mild spices",
        hasVariations: false,
        basePrice: 850,
      },
      {
        itemName: "Chicken Seekh Kebab",
        description: "Minced chicken kebabs grilled over open flame",
        hasVariations: false,
        basePrice: 700,
      },
      {
        itemName: "Beef Bihari Boti",
        description: "Tender beef boti with smoky bihari style flavor",
        hasVariations: false,
        basePrice: 1100,
      },
    ],
  },
  {
    category: "Beef Entrées",
    items: [
      {
        itemName: "Beef Karahi",
        description:
          "Spicy wok cooked beef karahi with tomatoes and green chilies",
        hasVariations: true,
        variations: [
          { name: "Half KG", price: 1650 },
          { name: "Full KG", price: 3100 },
        ],
      },
      {
        itemName: "Beef Handi",
        description: "Rich creamy beef handi cooked in traditional style",
        hasVariations: true,
        variations: [
          { name: "Half KG", price: 1750 },
          { name: "Full KG", price: 3250 },
        ],
      },
      {
        itemName: "Beef Nihari",
        description: "Slow cooked beef nihari with deep traditional flavor",
        hasVariations: false,
        basePrice: 780,
      },
      {
        itemName: "Beef Kofta Curry",
        description: "Soft beef koftas served in spiced curry gravy",
        hasVariations: false,
        basePrice: 850,
      },
    ],
  },
  {
    category: "Breakfast",
    items: [
      {
        itemName: "Halwa Puri",
        description:
          "Traditional breakfast platter with puri chana and halwa",
        hasVariations: false,
        basePrice: 520,
      },
      {
        itemName: "Desi Omelette",
        description: "Classic Pakistani style omelette with herbs and spices",
        hasVariations: false,
        basePrice: 320,
      },
      {
        itemName: "Paratha with Chai",
        description: "Fresh paratha served with hot milk tea",
        hasVariations: false,
        basePrice: 280,
      },
      {
        itemName: "Chana Paratha",
        description: "Lahori style chickpea curry served with paratha",
        hasVariations: false,
        basePrice: 420,
      },
    ],
  },
  {
    category: "Burgers & Sandwiches",
    items: [
      {
        itemName: "Zinger Burger",
        description: "Crispy chicken fillet burger with lettuce and mayo",
        hasVariations: false,
        basePrice: 590,
      },
      {
        itemName: "Beef Cheese Burger",
        description: "Juicy beef burger topped with cheese and house sauce",
        hasVariations: false,
        basePrice: 690,
      },
      {
        itemName: "Club Sandwich",
        description:
          "Triple layered sandwich with chicken egg and vegetables",
        hasVariations: false,
        basePrice: 550,
      },
      {
        itemName: "Grilled Chicken Sandwich",
        description:
          "Grilled chicken breast sandwich with fresh vegetables",
        hasVariations: false,
        basePrice: 620,
      },
    ],
  },
  {
    category: "Chef’s Specials",
    items: [
      {
        itemName: "Special Mutton Karahi",
        description:
          "Signature mutton karahi prepared in chef special spices",
        hasVariations: true,
        variations: [
          { name: "Half KG", price: 2200 },
          { name: "Full KG", price: 4200 },
        ],
      },
      {
        itemName: "Special Platter",
        description:
          "Mixed BBQ platter with kebab boti tikka and naan",
        hasVariations: false,
        basePrice: 2450,
      },
      {
        itemName: "Stuffed Chicken",
        description:
          "Oven cooked chicken breast stuffed with cheese and herbs",
        hasVariations: false,
        basePrice: 1450,
      },
      {
        itemName: "Chef Special Pasta",
        description:
          "Creamy pasta with chicken mushrooms and secret sauce",
        hasVariations: false,
        basePrice: 1250,
      },
    ],
  },
  {
    category: "Chicken Entrées",
    items: [
      {
        itemName: "Chicken Karahi",
        description:
          "Traditional chicken karahi cooked with tomatoes and spices",
        hasVariations: true,
        variations: [
          { name: "Half KG", price: 1350 },
          { name: "Full KG", price: 2550 },
        ],
      },
      {
        itemName: "Chicken Handi",
        description: "Creamy chicken handi served with naan",
        hasVariations: true,
        variations: [
          { name: "Half KG", price: 1450 },
          { name: "Full KG", price: 2700 },
        ],
      },
      {
        itemName: "Butter Chicken",
        description:
          "Tender chicken cooked in rich buttery tomato gravy",
        hasVariations: false,
        basePrice: 980,
      },
      {
        itemName: "Chicken Jalfrezi",
        description:
          "Boneless chicken tossed with vegetables and spices",
        hasVariations: false,
        basePrice: 920,
      },
    ],
  },
  {
    category: "Cold Beverages",
    items: [
      {
        itemName: "Mint Margarita",
        description:
          "Chilled mint margarita with refreshing citrus flavor",
        hasVariations: false,
        basePrice: 320,
      },
      {
        itemName: "Fresh Lemonade",
        description: "Fresh lemonade served chilled",
        hasVariations: false,
        basePrice: 250,
      },
      {
        itemName: "Iced Tea",
        description: "Cold brewed tea with lemon and ice",
        hasVariations: false,
        basePrice: 280,
      },
      {
        itemName: "Cold Coffee",
        description: "Creamy cold coffee topped with ice",
        hasVariations: false,
        basePrice: 350,
      },
    ],
  },
  {
    category: "Desserts",
    items: [
      {
        itemName: "Gulab Jamun",
        description: "Soft warm gulab jamun served in sugar syrup",
        hasVariations: false,
        basePrice: 220,
      },
      {
        itemName: "Kheer",
        description:
          "Traditional rice pudding with cardamom and nuts",
        hasVariations: false,
        basePrice: 260,
      },
      {
        itemName: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center",
        hasVariations: false,
        basePrice: 480,
      },
      {
        itemName: "Ice Cream Sundae",
        description:
          "Vanilla ice cream with chocolate syrup and nuts",
        hasVariations: false,
        basePrice: 420,
      },
    ],
  },
  {
    category: "Fast Food",
    items: [
      {
        itemName: "Crispy Broast",
        description: "Crunchy fried chicken broast with seasoning",
        hasVariations: true,
        variations: [
          { name: "2 Pieces", price: 520 },
          { name: "4 Pieces", price: 980 },
        ],
      },
      {
        itemName: "Chicken Shawarma",
        description:
          "Soft wrap filled with chicken garlic sauce and vegetables",
        hasVariations: false,
        basePrice: 320,
      },
      {
        itemName: "Loaded Fries",
        description:
          "French fries topped with sauce cheese and chicken",
        hasVariations: false,
        basePrice: 450,
      },
      {
        itemName: "Chicken Nuggets",
        description: "Crispy golden chicken nuggets with dip",
        hasVariations: true,
        variations: [
          { name: "6 Pieces", price: 350 },
          { name: "10 Pieces", price: 550 },
        ],
      },
    ],
  },
  {
    category: "Hot Beverages",
    items: [
      {
        itemName: "Doodh Patti",
        description: "Strong milk tea prepared in local style",
        hasVariations: true,
        variations: [
          { name: "Regular", price: 120 },
          { name: "Large", price: 180 },
        ],
      },
      {
        itemName: "Green Tea",
        description: "Light and refreshing green tea",
        hasVariations: false,
        basePrice: 140,
      },
      {
        itemName: "Cappuccino",
        description: "Freshly brewed cappuccino with milk foam",
        hasVariations: false,
        basePrice: 320,
      },
      {
        itemName: "Hot Chocolate",
        description: "Rich creamy hot chocolate",
        hasVariations: false,
        basePrice: 360,
      },
    ],
  },
  {
    category: "Pasta",
    items: [
      {
        itemName: "Alfredo Pasta",
        description: "Creamy alfredo pasta with grilled chicken",
        hasVariations: false,
        basePrice: 950,
      },
      {
        itemName: "Arrabiata Pasta",
        description: "Penne pasta in spicy tomato sauce",
        hasVariations: false,
        basePrice: 880,
      },
      {
        itemName: "Macaroni Cheese",
        description:
          "Cheesy baked macaroni with creamy texture",
        hasVariations: false,
        basePrice: 820,
      },
      {
        itemName: "Chicken Mushroom Pasta",
        description:
          "Pasta with chicken mushrooms and creamy sauce",
        hasVariations: false,
        basePrice: 990,
      },
    ],
  },
  {
    category: "Pizza",
    items: [
      {
        itemName: "Chicken Fajita Pizza",
        description:
          "Pizza topped with fajita chicken onions and capsicum",
        hasVariations: true,
        variations: [
          { name: "Small", price: 1200 },
          { name: "Medium", price: 1800 },
          { name: "Large", price: 2200 },
        ],
      },
      {
        itemName: "Malai Boti Pizza",
        description: "Creamy malai boti pizza with cheese",
        hasVariations: true,
        variations: [
          { name: "Small", price: 1250 },
          { name: "Medium", price: 1850 },
          { name: "Large", price: 2300 },
        ],
      },
      {
        itemName: "Pepperoni Pizza",
        description:
          "Classic pepperoni pizza with mozzarella cheese",
        hasVariations: true,
        variations: [
          { name: "Small", price: 1350 },
          { name: "Medium", price: 1950 },
          { name: "Large", price: 2400 },
        ],
      },
      {
        itemName: "Veggie Supreme Pizza",
        description:
          "Loaded vegetable pizza with olives mushrooms and peppers",
        hasVariations: true,
        variations: [
          { name: "Small", price: 1100 },
          { name: "Medium", price: 1700 },
          { name: "Large", price: 2100 },
        ],
      },
    ],
  },
  {
    category: "Rice & Biryani",
    items: [
      {
        itemName: "Chicken Biryani",
        description:
          "Fragrant basmati rice with layered spiced chicken",
        hasVariations: false,
        basePrice: 450,
      },
      {
        itemName: "Beef Biryani",
        description:
          "Aromatic rice with tender beef and traditional masala",
        hasVariations: false,
        basePrice: 520,
      },
      {
        itemName: "Chicken Pulao",
        description:
          "Mildly spiced pulao rice with chicken pieces",
        hasVariations: false,
        basePrice: 420,
      },
      {
        itemName: "Fried Rice",
        description:
          "Stir fried rice with vegetables and chicken",
        hasVariations: false,
        basePrice: 480,
      },
    ],
  },
  {
    category: "Salads",
    items: [
      {
        itemName: "Russian Salad",
        description: "Creamy mixed fruit and vegetable salad",
        hasVariations: false,
        basePrice: 320,
      },
      {
        itemName: "Caesar Salad",
        description:
          "Fresh lettuce with chicken croutons and caesar dressing",
        hasVariations: false,
        basePrice: 520,
      },
      {
        itemName: "Garden Salad",
        description:
          "Fresh seasonal vegetables with light dressing",
        hasVariations: false,
        basePrice: 280,
      },
      {
        itemName: "Coleslaw",
        description:
          "Shredded cabbage and carrot in creamy dressing",
        hasVariations: false,
        basePrice: 220,
      },
    ],
  },
  {
    category: "Seafood",
    items: [
      {
        itemName: "Fish & Chips",
        description:
          "Crispy fried fish served with fries and dip",
        hasVariations: false,
        basePrice: 890,
      },
      {
        itemName: "Grilled Fish Fillet",
        description:
          "Tender grilled fish fillet with herbs and lemon",
        hasVariations: false,
        basePrice: 1250,
      },
      {
        itemName: "Prawn Tempura",
        description:
          "Light crispy tempura prawns with dipping sauce",
        hasVariations: false,
        basePrice: 1350,
      },
      {
        itemName: "Fish Karahi",
        description: "Fish cooked in spicy karahi masala",
        hasVariations: false,
        basePrice: 1100,
      },
    ],
  },
  {
    category: "Sides",
    items: [
      {
        itemName: "French Fries",
        description: "Crispy golden fries with seasoning",
        hasVariations: true,
        variations: [
          { name: "Regular", price: 220 },
          { name: "Large", price: 350 },
        ],
      },
      {
        itemName: "Masala Fries",
        description: "Fries tossed in spicy masala seasoning",
        hasVariations: true,
        variations: [
          { name: "Regular", price: 250 },
          { name: "Large", price: 380 },
        ],
      },
      {
        itemName: "Garlic Mayo Dip",
        description: "Creamy garlic mayo dip portion",
        hasVariations: false,
        basePrice: 80,
      },
      {
        itemName: "Coleslaw Side",
        description: "Fresh creamy coleslaw side serving",
        hasVariations: false,
        basePrice: 120,
      },
    ],
  },
  {
    category: "Soft Drinks",
    items: [
      {
        itemName: "Coca Cola",
        description: "Chilled soft drink bottle",
        hasVariations: true,
        variations: [
          { name: "Regular", price: 120 },
          { name: "1 Litre", price: 220 },
          { name: "1.5 Litre", price: 280 },
        ],
      },
      {
        itemName: "Sprite",
        description: "Refreshing lemon lime soft drink",
        hasVariations: true,
        variations: [
          { name: "Regular", price: 120 },
          { name: "1 Litre", price: 220 },
          { name: "1.5 Litre", price: 280 },
        ],
      },
      {
        itemName: "Fanta",
        description:
          "Orange flavored soft drink served chilled",
        hasVariations: true,
        variations: [
          { name: "Regular", price: 120 },
          { name: "1 Litre", price: 220 },
          { name: "1.5 Litre", price: 280 },
        ],
      },
      {
        itemName: "Mineral Water",
        description: "Pure bottled drinking water",
        hasVariations: true,
        variations: [
          { name: "Small", price: 80 },
          { name: "Large", price: 150 },
        ],
      },
    ],
  },
  {
    category: "Soups",
    items: [
      {
        itemName: "Chicken Corn Soup",
        description:
          "Classic chicken corn soup with mild seasoning",
        hasVariations: true,
        variations: [
          { name: "Single Bowl", price: 280 },
          { name: "Family Bowl", price: 650 },
        ],
      },
      {
        itemName: "Hot & Sour Soup",
        description:
          "Spicy and tangy soup with chicken and vegetables",
        hasVariations: true,
        variations: [
          { name: "Single Bowl", price: 300 },
          { name: "Family Bowl", price: 700 },
        ],
      },
      {
        itemName: "Thai Soup",
        description:
          "Creamy Thai style soup with chicken",
        hasVariations: true,
        variations: [
          { name: "Single Bowl", price: 320 },
          { name: "Family Bowl", price: 750 },
        ],
      },
      {
        itemName: "Vegetable Soup",
        description: "Fresh vegetable soup with light herbs",
        hasVariations: false,
        basePrice: 240,
      },
    ],
  },
  {
    category: "Starters",
    items: [
      {
        itemName: "Dynamite Chicken",
        description:
          "Crispy chicken bites coated in spicy dynamite sauce",
        hasVariations: false,
        basePrice: 680,
      },
      {
        itemName: "Chicken Wings",
        description: "Hot and crispy chicken wings",
        hasVariations: true,
        variations: [
          { name: "6 Pieces", price: 520 },
          { name: "12 Pieces", price: 950 },
        ],
      },
      {
        itemName: "Mozzarella Sticks",
        description:
          "Crispy mozzarella sticks served with dip",
        hasVariations: false,
        basePrice: 540,
      },
      {
        itemName: "Stuffed Potato Skins",
        description:
          "Potato skins loaded with cheese and toppings",
        hasVariations: false,
        basePrice: 580,
      },
    ],
  },
  {
    category: "Vegetarian",
    items: [
      {
        itemName: "Vegetable Chow Mein",
        description:
          "Stir fried noodles with fresh vegetables",
        hasVariations: false,
        basePrice: 520,
      },
      {
        itemName: "Paneer Karahi",
        description:
          "Cottage cheese cooked in spicy karahi masala",
        hasVariations: false,
        basePrice: 890,
      },
      {
        itemName: "Vegetable Biryani",
        description:
          "Aromatic rice cooked with vegetables and spices",
        hasVariations: false,
        basePrice: 420,
      },
      {
        itemName: "Mix Vegetable Curry",
        description:
          "Seasonal vegetables cooked in rich curry sauce",
        hasVariations: false,
        basePrice: 480,
      },
    ],
  },
];

async function upsertMenuItemForBranch(
  branchId: number,
  categoryName: string,
  item: MenuItemSeed
) {
  const existing = await prisma.menu.findFirst({
    where: {
      branchId,
      category: categoryName,
      itemName: item.itemName,
    },
    select: { id: true },
  });

  const hasVars = item.hasVariations;
  const normalizedVariations = hasVars ? item.variations ?? [] : [];
  const minVariationPrice =
    hasVars && normalizedVariations.length > 0
      ? Math.min(...normalizedVariations.map((v) => v.price))
      : null;

  const payload = {
    itemName: item.itemName,
    description: item.description,
    branchId,
    category: categoryName,
    hasVariations: hasVars,
    basePrice: hasVars ? null : item.basePrice ?? 0,
    price: hasVars ? minVariationPrice ?? 0 : item.basePrice ?? 0,
    status: "ACTIVE" as const,
  };

  if (!existing) {
    const created = await prisma.menu.create({
      data: payload,
      select: { id: true },
    });
    return { id: created.id, created: true };
  }

  await prisma.menu.update({
    where: { id: existing.id },
    data: payload,
  });
  return { id: existing.id, created: false };
}

async function syncVariations(menuId: number, item: MenuItemSeed) {
  if (!item.hasVariations) {
    const deleted = await prisma.menuVariation.deleteMany({
      where: { menuId },
    });
    return { created: 0, removed: deleted.count };
  }

  const variations = item.variations ?? [];
  await prisma.menuVariation.deleteMany({ where: { menuId } });

  if (variations.length === 0) return { created: 0, removed: 0 };

  await prisma.menuVariation.createMany({
    data: variations.map((v, idx) => ({
      menuId,
      name: v.name,
      price: v.price,
      sortOrder: idx,
    })),
  });

  return { created: variations.length, removed: 0 };
}

async function main() {
  console.log("Seeding menu items for existing categories...");

  const activeBranches = await prisma.branch.findMany({
    where: { status: "Active" },
    select: { branch_id: true, branch_name: true },
  });

  if (activeBranches.length === 0) {
    console.log("No active branches found. Please create/activate a branch first.");
    return;
  }

  let categoriesCovered = 0;
  let menuCreated = 0;
  let menuUpdated = 0;
  let variationRowsCreated = 0;

  for (const branch of activeBranches) {
    console.log(`\nBranch: ${branch.branch_name}`);

    for (const categorySeed of MENU_DATA) {
      const category = await prisma.category.findFirst({
        where: {
          branch_id: branch.branch_id,
          name: categorySeed.category,
        },
        select: { category_id: true, name: true },
      });

      if (!category) {
        console.log(`  - Skipped (category missing): ${categorySeed.category}`);
        continue;
      }

      categoriesCovered += 1;

      for (const item of categorySeed.items) {
        const menu = await upsertMenuItemForBranch(
          branch.branch_id,
          category.name,
          item
        );

        if (menu.created) menuCreated += 1;
        else menuUpdated += 1;

        const variationStats = await syncVariations(menu.id, item);
        variationRowsCreated += variationStats.created;
      }
    }
  }

  console.log("\nMenu item seed completed.");
  console.log(`Category mappings processed: ${categoriesCovered}`);
  console.log(`Menu items created: ${menuCreated}`);
  console.log(`Menu items updated: ${menuUpdated}`);
  console.log(`Variation rows created: ${variationRowsCreated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

