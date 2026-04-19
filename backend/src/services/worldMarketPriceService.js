const { prisma } = require("../config/database");

// Commodity-to-product mapping for local price comparison
const COMMODITY_PRODUCT_MAP = {
  DIESEL: ["diesel", "diesel fuel", "agr diesel"],
  PETROL: ["petrol", "gasoline", "fuel", "premium petrol"],
  CEMENT: ["cement", "portland cement", "building cement"],
};

// Default reference prices (USD) – used only when seeding for the first time
const DEFAULT_PRICES = {
  DIESEL: { priceUSD: 82.0, unit: "per barrel" },
  PETROL: { priceUSD: 85.0, unit: "per barrel" },
  CEMENT: { priceUSD: 120.0, unit: "per tonne" },
};

/**
 * Seed initial world market prices if none exist.
 */
async function seedDefaults(exchangeRate = 15.5) {
  const existing = await prisma.worldMarketPrice.count();
  if (existing > 0) return;

  for (const [commodity, info] of Object.entries(DEFAULT_PRICES)) {
    await prisma.worldMarketPrice.create({
      data: {
        commodity,
        worldPriceUSD: info.priceUSD,
        previousPriceUSD: info.priceUSD,
        percentageChange: 0,
        exchangeRate,
        cediEquivalent: +(info.priceUSD * exchangeRate).toFixed(2),
        unit: info.unit,
        source: "initial seed",
      },
    });
  }
}

/**
 * Get latest world market prices for all tracked commodities.
 */
async function getLatestPrices() {
  await seedDefaults();
  return prisma.worldMarketPrice.findMany({
    orderBy: { commodity: "asc" },
    include: {
      history: { orderBy: { recordedAt: "desc" }, take: 10 },
    },
  });
}

/**
 * Get a single commodity's latest price.
 */
async function getCommodityPrice(commodity) {
  return prisma.worldMarketPrice.findUnique({ where: { commodity } });
}

/**
 * Admin updates a commodity's world price.
 * Calculates percentage change and converts to GHS.
 */
async function updateWorldPrice(commodity, newPriceUSD, exchangeRate) {
  const current = await prisma.worldMarketPrice.findUnique({
    where: { commodity },
  });

  if (!current) {
    throw new Error(`Commodity ${commodity} not found. Run seed first.`);
  }

  const previousPriceUSD = current.worldPriceUSD;
  const percentageChange =
    previousPriceUSD > 0
      ? +(((newPriceUSD - previousPriceUSD) / previousPriceUSD) * 100).toFixed(2)
      : 0;
  const rate = exchangeRate || current.exchangeRate;
  const cediEquivalent = +(newPriceUSD * rate).toFixed(2);

  // Save history snapshot before updating
  await prisma.worldMarketPriceHistory.create({
    data: {
      commodity,
      worldPriceUSD: previousPriceUSD,
      percentageChange: current.percentageChange,
      exchangeRate: current.exchangeRate,
      cediEquivalent: current.cediEquivalent,
      worldMarketPriceId: current.id,
    },
  });

  // Update current record
  return prisma.worldMarketPrice.update({
    where: { commodity },
    data: {
      worldPriceUSD: newPriceUSD,
      previousPriceUSD,
      percentageChange,
      exchangeRate: rate,
      cediEquivalent,
      source: "admin update",
    },
  });
}

/**
 * Match a product name to its world-market commodity (if any).
 * Returns the commodity key or null.
 */
function matchCommodity(productName) {
  const lower = (productName || "").toLowerCase();
  for (const [commodity, keywords] of Object.entries(COMMODITY_PRODUCT_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return commodity;
  }
  return null;
}

/**
 * AI price comparison: given a product's local price, compare it against the
 * world market benchmark converted to cedis.
 *
 * Returns an analysis object the frontend can display.
 */
async function getAIComparison(productName, localPriceGHS) {
  const commodity = matchCommodity(productName);
  if (!commodity) {
    return {
      matched: false,
      commodity: null,
      message: "This product is not tracked on world markets.",
    };
  }

  const data = await getCommodityPrice(commodity);
  if (!data) {
    return { matched: false, commodity, message: "No world market data available." };
  }

  const localVsWorld =
    data.cediEquivalent > 0
      ? +(((localPriceGHS - data.cediEquivalent) / data.cediEquivalent) * 100).toFixed(2)
      : 0;

  let verdict;
  if (Math.abs(localVsWorld) < 5) {
    verdict = "FAIR";
  } else if (localVsWorld > 0) {
    verdict = "ABOVE_MARKET";
  } else {
    verdict = "BELOW_MARKET";
  }

  const trendDirection = data.percentageChange >= 0 ? "up" : "down";

  return {
    matched: true,
    commodity,
    worldPriceUSD: data.worldPriceUSD,
    previousPriceUSD: data.previousPriceUSD,
    worldPriceChangePercent: data.percentageChange,
    exchangeRate: data.exchangeRate,
    cediEquivalent: data.cediEquivalent,
    unit: data.unit,
    localPriceGHS,
    localVsWorldPercent: localVsWorld,
    verdict,
    trend: trendDirection,
    summary: buildSummary(commodity, data, localPriceGHS, localVsWorld, verdict, trendDirection),
    updatedAt: data.updatedAt,
  };
}

/**
 * Bulk comparison for the aggregated product list.
 * Appends world-market-aware change% to products that match a commodity.
 */
async function enrichProductsWithWorldData(products) {
  await seedDefaults();
  const worldPrices = await prisma.worldMarketPrice.findMany();
  const priceMap = {};
  for (const wp of worldPrices) priceMap[wp.commodity] = wp;

  return products.map((p) => {
    const commodity = matchCommodity(p.name);
    if (!commodity || !priceMap[commodity]) return p;

    const wp = priceMap[commodity];
    const changeStr =
      wp.percentageChange >= 0
        ? `+${wp.percentageChange}%`
        : `${wp.percentageChange}%`;

    return {
      ...p,
      change: changeStr,
      up: wp.percentageChange >= 0,
      worldMarket: {
        commodity,
        worldPriceUSD: wp.worldPriceUSD,
        cediEquivalent: wp.cediEquivalent,
        percentageChange: wp.percentageChange,
        exchangeRate: wp.exchangeRate,
        unit: wp.unit,
      },
    };
  });
}

function buildSummary(commodity, data, localPrice, diffPercent, verdict, trend) {
  const name = commodity.charAt(0) + commodity.slice(1).toLowerCase();
  const lines = [];

  lines.push(
    `${name} is currently trading at $${data.worldPriceUSD} ${data.unit} on the world market ` +
      `(${data.percentageChange >= 0 ? "+" : ""}${data.percentageChange}% from the previous update).`
  );
  lines.push(
    `At the current exchange rate of GHS ${data.exchangeRate}/USD, the equivalent is GHS ${data.cediEquivalent}.`
  );

  if (verdict === "FAIR") {
    lines.push(
      `Your local price of GHS ${localPrice} is within 5% of the world benchmark — this is a fair price.`
    );
  } else if (verdict === "ABOVE_MARKET") {
    lines.push(
      `Your local price of GHS ${localPrice} is ${diffPercent}% above the world benchmark. Consider comparing sellers.`
    );
  } else {
    lines.push(
      `Your local price of GHS ${localPrice} is ${Math.abs(diffPercent)}% below the world benchmark — a good deal.`
    );
  }

  lines.push(`World market trend: ${trend === "up" ? "Prices are rising ↑" : "Prices are falling ↓"}.`);

  return lines.join(" ");
}

module.exports = {
  seedDefaults,
  getLatestPrices,
  getCommodityPrice,
  updateWorldPrice,
  matchCommodity,
  getAIComparison,
  enrichProductsWithWorldData,
};
