import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_CATEGORIES: { name: string; items: { name: string; price: number }[] }[] = [
  {
    name: "BBQ",
    items: [
      { name: "Chicken Tikka", price: 850 },
      { name: "Seekh Kabab", price: 650 },
      { name: "Malai Boti", price: 950 },
      { name: "BBQ Platter", price: 2500 },
      { name: "Reshmi Kabab", price: 750 },
    ],
  },
  {
    name: "Karahi",
    items: [
      { name: "Chicken Karahi", price: 1800 },
      { name: "Mutton Karahi", price: 2800 },
      { name: "Prawn Karahi", price: 2200 },
      { name: "Daal Karahi", price: 900 },
    ],
  },
  {
    name: "Burgers",
    items: [
      { name: "Classic Burger", price: 550 },
      { name: "Cheese Burger", price: 650 },
      { name: "Zinger Burger", price: 700 },
      { name: "Double Patty Burger", price: 900 },
      { name: "BBQ Burger", price: 750 },
      { name: "Mushroom Burger", price: 800 },
    ],
  },
  {
    name: "Pizza",
    items: [
      { name: "Margherita Pizza", price: 1200 },
      { name: "Pepperoni Pizza", price: 1400 },
      { name: "Chicken Fajita Pizza", price: 1500 },
      { name: "BBQ Chicken Pizza", price: 1500 },
    ],
  },
  {
    name: "Drinks",
    items: [
      { name: "Chai Khas Special", price: 200 },
      { name: "Green Tea", price: 250 },
      { name: "Fresh Lime", price: 300 },
      { name: "Mango Shake", price: 450 },
      { name: "Cold Coffee", price: 400 },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Gulab Jamun", price: 350 },
      { name: "Kheer", price: 400 },
      { name: "Brownie", price: 500 },
    ],
  },
  {
    name: "Rice",
    items: [
      { name: "Chicken Biryani", price: 600 },
      { name: "Mutton Pulao", price: 800 },
      { name: "Egg Fried Rice", price: 450 },
      { name: "Vegetable Rice", price: 400 },
    ],
  },
  {
    name: "Sandwiches",
    items: [
      { name: "Club Sandwich", price: 550 },
      { name: "Grilled Chicken Sandwich", price: 600 },
      { name: "Egg Mayo Sandwich", price: 400 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding categories and dishes...");

  // Get all active branches
  const branches = await prisma.branch.findMany({
    where: { status: "Active" },
  });

  if (branches.length === 0) {
    console.log("⚠️  No active branches found. Please create branches first.");
    return;
  }

  console.log(`📦 Found ${branches.length} active branch(es)`);

  for (const branch of branches) {
    console.log(`\n🏢 Processing branch: ${branch.branch_name} (ID: ${branch.branch_id})`);

    for (const demoCat of DEMO_CATEGORIES) {
      // Check if category already exists for this branch
      const existing = await prisma.category.findFirst({
        where: {
          branch_id: branch.branch_id,
          name: demoCat.name,
        },
      });

      if (existing) {
        console.log(`  ⏭️  Category "${demoCat.name}" already exists, skipping...`);
        continue;
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          name: demoCat.name,
          description: null,
          branch_id: branch.branch_id,
          kid: 0, // Active
          terminal: 1,
        },
      });

      console.log(`  ✅ Created category: ${category.name}`);

      // Create dishes for this category
      for (const demoItem of demoCat.items) {
        await prisma.menuItem.create({
          data: {
            name: demoItem.name,
            description: null,
            price: demoItem.price,
            category_id: category.category_id,
            branch_id: branch.branch_id,
            is_available: 1,
            terminal: 1,
            qnty: 0,
            is_frequent: 0,
            discount: 0,
          },
        });
      }

      console.log(`    ✅ Created ${demoCat.items.length} dishes`);
    }
  }

  console.log("\n✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
