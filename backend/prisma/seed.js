require("dotenv").config();
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("🌱 Seeding MarketWise database…");

  // ── Clear existing data ──────────────────────────────────────────
  await prisma.priceSubmission.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.savedProduct.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.market.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hashSync(p, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Samuel Owusu",
      email: "admin@marketwise.gh",
      password: hash("Admin1234!"),
      role: "ADMIN",
      phone: "+233 24 000 0001",
      location: "Accra, Greater Accra",
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      name: "Kofi Mensah",
      email: "kofi@example.com",
      password: hash("Seller123!"),
      role: "SELLER",
      phone: "+233 24 111 2222",
      location: "Accra, Greater Accra",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "Yaw Darko",
      email: "yaw@example.com",
      password: hash("Seller123!"),
      role: "SELLER",
      phone: "+233 24 333 4444",
      location: "Kumasi, Ashanti",
      status: "PENDING",
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      name: "Kweku Boateng",
      email: "kweku@example.com",
      password: hash("Seller123!"),
      role: "SELLER",
      phone: "+233 24 555 6666",
      location: "Kumasi, Ashanti",
      status: "SUSPENDED",
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      name: "Ama Owusu",
      email: "ama@example.com",
      password: hash("Buyer123!"),
      role: "BUYER",
      phone: "+233 24 777 8888",
      location: "Kumasi, Ashanti",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "Abena Asante",
      email: "abena@example.com",
      password: hash("Buyer123!"),
      role: "BUYER",
      phone: "+233 24 999 0000",
      location: "Accra, Greater Accra",
    },
  });

  // ── Markets ──────────────────────────────────────────────────────
  const marketData = [
    { name: "Accra Central Market", city: "Accra", region: "Greater Accra", open: true, hours: "6am – 8pm", distance: "2.3 km" },
    { name: "Kumasi Central Market", city: "Kumasi", region: "Ashanti", open: true, hours: "5am – 9pm", distance: "210 km" },
    { name: "Kaneshie Market", city: "Accra", region: "Greater Accra", open: true, hours: "7am – 7pm", distance: "5.1 km" },
    { name: "Takoradi Market", city: "Takoradi", region: "Western", open: false, hours: "6am – 6pm", distance: "248 km" },
    { name: "Makola Market", city: "Accra", region: "Greater Accra", open: true, hours: "5:30am – 8pm", distance: "3.1 km" },
    { name: "Madina Market", city: "Accra", region: "Greater Accra", open: true, hours: "7am – 7pm", distance: "6.1 km" },
    { name: "Kejetia Market", city: "Kumasi", region: "Ashanti", open: true, hours: "5am – 9pm", distance: "212 km" },
    { name: "Tema Market", city: "Tema", region: "Greater Accra", open: false, hours: "6am – 6pm", distance: "18 km" },
  ];

  const markets = {};
  for (const m of marketData) {
    const created = await prisma.market.create({ data: m });
    markets[m.name] = created;
  }

  // ── Products ─────────────────────────────────────────────────────
  const productData = [
    // Food — Seller1 (Accra Central)
    { name: "Rice (50kg bag)", category: "Grains", description: "Premium long-grain rice, freshly milled.", unit: "bag", price: 265, stock: 80, minStock: 10, seller: seller1, market: "Accra Central Market" },
    { name: "Cooking Oil (2L)", category: "Cooking Essentials", description: "Refined sunflower cooking oil.", unit: "litre", price: 34, stock: 35, minStock: 10, seller: seller1, market: "Kaneshie Market" },
    { name: "Tomatoes (1kg)", category: "Vegetables", description: "Fresh locally-grown tomatoes.", unit: "kg", price: 9, stock: 12, minStock: 15, seller: seller1, market: "Takoradi Market" },
    { name: "Onions (1kg)", category: "Vegetables", description: "Fresh red onions, bulk available.", unit: "kg", price: 7, stock: 50, minStock: 10, seller: seller1, market: "Madina Market" },
    { name: "Chicken (1kg)", category: "Proteins", description: "Fresh dressed chicken, chilled.", unit: "kg", price: 28, stock: 20, minStock: 8, seller: seller1, market: "Accra Central Market" },
    { name: "Yam (medium)", category: "Vegetables", description: "Medium-sized water yam.", unit: "piece", price: 15, stock: 40, minStock: 10, seller: seller1, market: "Kumasi Central Market" },
    { name: "Eggs (crate×30)", category: "Proteins", description: "Fresh farm eggs, crate of 30.", unit: "crate", price: 50, stock: 60, minStock: 15, seller: seller1, market: "Kaneshie Market" },
    // Electronics — Seller2
    { name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", description: "Apple iPhone 16 Pro Max 256GB — unlocked.", unit: "unit", price: 8500, stock: 8, minStock: 3, seller: seller2, market: "Accra Central Market" },
    { name: "Samsung Galaxy S24 Ultra", category: "Smartphones", description: "Samsung Galaxy S24 Ultra 256GB.", unit: "unit", price: 7200, stock: 12, minStock: 3, seller: seller2, market: "Kumasi Central Market" },
    { name: "Samsung Galaxy A55 5G", category: "Smartphones", description: "Samsung Galaxy A55 5G 128GB.", unit: "unit", price: 3200, stock: 25, minStock: 5, seller: seller2, market: "Madina Market" },
    { name: "MacBook Air M3 (13\")", category: "Laptops", description: "Apple MacBook Air 13\" M3 chip, 8GB RAM, 256GB SSD.", unit: "unit", price: 13500, stock: 5, minStock: 2, seller: seller2, market: "Accra Central Market" },
    { name: "HP Pavilion 15 (Core i7)", category: "Laptops", description: "HP Pavilion 15.6\" Intel Core i7.", unit: "unit", price: 6800, stock: 10, minStock: 3, seller: seller2, market: "Kaneshie Market" },
    { name: "Lenovo IdeaPad 3 (Core i5)", category: "Laptops", description: "Lenovo IdeaPad 3 Core i5, 8GB RAM.", unit: "unit", price: 5400, stock: 14, minStock: 3, seller: seller2, market: "Kumasi Central Market" },
    { name: "Dell OptiPlex 7010 (i5)", category: "Desktops", description: "Dell OptiPlex 7010, Core i5, 16GB RAM.", unit: "unit", price: 4200, stock: 7, minStock: 2, seller: seller2, market: "Accra Central Market" },
    { name: "HP ProDesk 400 (Ryzen 5)", category: "Desktops", description: "HP ProDesk 400 G9 Mini, AMD Ryzen 5.", unit: "unit", price: 3900, stock: 9, minStock: 2, seller: seller2, market: "Kaneshie Market" },
    // Seller3 food products  
    { name: "Rice (50kg bag)", category: "Grains", description: "Long-grain white rice.", unit: "bag", price: 275, stock: 60, minStock: 10, seller: seller3, market: "Kaneshie Market" },
    { name: "Cooking Oil (2L)", category: "Cooking Essentials", description: "Palm oil blend, 2L.", unit: "litre", price: 36, stock: 30, minStock: 10, seller: seller3, market: "Kumasi Central Market" },
    { name: "Tomatoes (1kg)", category: "Vegetables", description: "Roma tomatoes, locally grown.", unit: "kg", price: 10, stock: 25, minStock: 15, seller: seller3, market: "Kumasi Central Market" },
    { name: "iPhone 16 Pro Max (256GB)", category: "Smartphones", description: "Apple iPhone 16 Pro Max, Titanium.", unit: "unit", price: 8900, stock: 5, minStock: 2, seller: seller3, market: "Kaneshie Market" },
  ];

  const products = [];
  for (const p of productData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        description: p.description,
        unit: p.unit,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        status: p.stock < p.minStock ? "ALERT" : "ACTIVE",
        sellerId: p.seller.id,
        marketId: markets[p.market].id,
      },
    });
    products.push(product);

    // Create initial price history
    await prisma.priceHistory.create({
      data: { productId: product.id, sellerId: p.seller.id, price: p.price },
    });
  }

  // ── Shopping list items for buyer1 ──────────────────────────────
  await prisma.shoppingItem.createMany({
    data: [
      { name: "Rice (50kg bag)", category: "Grains", quantity: "1 bag", checked: false, userId: buyer1.id },
      { name: "Tomatoes (1kg)", category: "Vegetables", quantity: "2 kg", checked: true, userId: buyer1.id },
      { name: "Cooking Oil (2L)", category: "Cooking Essentials", quantity: "1 bottle", checked: false, userId: buyer1.id },
      { name: "Eggs (crate×30)", category: "Proteins", quantity: "1 crate", checked: false, userId: buyer1.id },
    ],
  });

  // ── Price alerts for buyer1 ──────────────────────────────────────
  await prisma.priceAlert.createMany({
    data: [
      { product: "Rice (50kg bag)", condition: "below GH₵270", current: 265, target: 270, userId: buyer1.id },
      { product: "Cooking Oil (2L)", condition: "any change >5%", current: 34, target: 34, userId: buyer1.id },
    ],
  });

  // ── Saved products for buyer1 ───────────────────────────────────
  const rice = products.find((p) => p.name === "Rice (50kg bag)" && p.sellerId === seller1.id);
  const chicken = products.find((p) => p.name === "Chicken (1kg)");
  const iphone = products.find((p) => p.name === "iPhone 16 Pro Max (256GB)" && p.sellerId === seller2.id);
  if (rice) await prisma.savedProduct.create({ data: { userId: buyer1.id, productId: rice.id } });
  if (chicken) await prisma.savedProduct.create({ data: { userId: buyer1.id, productId: chicken.id } });
  if (iphone) await prisma.savedProduct.create({ data: { userId: buyer1.id, productId: iphone.id } });

  // ── Orders ────────────────────────────────────────────────────────
  if (rice && chicken) {
    const order1 = await prisma.order.create({
      data: {
        buyerId: buyer1.id,
        sellerId: seller1.id,
        marketId: markets["Accra Central Market"].id,
        status: "CONFIRMED",
        items: {
          create: [
            { productId: rice.id, productName: rice.name, quantity: 1, unit: "bag", price: rice.price, total: rice.price },
            { productId: chicken.id, productName: chicken.name, quantity: 2, unit: "kg", price: chicken.price, total: chicken.price * 2 },
          ],
        },
      },
    });
  }

  const eggs = products.find((p) => p.name === "Eggs (crate×30)");
  if (eggs) {
    await prisma.order.create({
      data: {
        buyerId: buyer2.id,
        sellerId: seller1.id,
        marketId: markets["Kaneshie Market"].id,
        status: "PENDING",
        items: {
          create: [{ productId: eggs.id, productName: eggs.name, quantity: 3, unit: "crate", price: eggs.price, total: eggs.price * 3 }],
        },
      },
    });
  }

  if (iphone) {
    await prisma.order.create({
      data: {
        buyerId: buyer1.id,
        sellerId: seller2.id,
        marketId: markets["Accra Central Market"].id,
        status: "DELIVERED",
        items: {
          create: [{ productId: iphone.id, productName: iphone.name, quantity: 1, unit: "unit", price: iphone.price, total: iphone.price }],
        },
      },
    });
  }

  // ── Price submissions ────────────────────────────────────────────
  if (rice) {
    await prisma.priceSubmission.createMany({
      data: [
        {
          productId: rice.id,
          sellerId: seller1.id,
          productName: rice.name,
          price: 290,
          prevPrice: 265,
          change: "+9.4%",
          up: true,
          status: "PENDING",
          market: "Accra Central Market",
        },
      ],
    });
  }

  const tomatoes = products.find((p) => p.name === "Tomatoes (1kg)" && p.sellerId === seller1.id);
  if (tomatoes) {
    await prisma.priceSubmission.create({
      data: {
        productId: tomatoes.id,
        sellerId: seller1.id,
        productName: tomatoes.name,
        price: 6,
        prevPrice: 9,
        change: "-33.3%",
        up: false,
        status: "FLAGGED",
        market: "Takoradi Market",
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log("\nTest accounts:");
  console.log("  Admin:  admin@marketwise.gh / Admin1234!");
  console.log("  Seller: kofi@example.com    / Seller123!");
  console.log("  Buyer:  ama@example.com     / Buyer123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
