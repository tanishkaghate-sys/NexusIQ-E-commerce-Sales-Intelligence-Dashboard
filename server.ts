import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mock Data Generation (Superstore Style)
  const categories = ["Technology", "Furniture", "Office Supplies"];
  const regions = ["North", "South", "East", "West"];
  const segments = ["Consumer", "Corporate", "Home Office"];
  
  const generateData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 1000; i++) {
      const date = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const sales = Math.random() * 500 + 50;
      const profit = sales * (Math.random() * 0.4 - 0.1); // -10% to 30% profit
      data.push({
        id: `ORD-${1000 + i}`,
        date: date.toISOString(),
        category: categories[Math.floor(Math.random() * categories.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        segment: segments[Math.floor(Math.random() * segments.length)],
        sales: parseFloat(sales.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        quantity: Math.floor(Math.random() * 10) + 1,
      });
    }
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const salesData = generateData();

  // API Routes
  app.get("/api/sales", (req, res) => {
    res.json(salesData);
  });

  app.get("/api/stats", (req, res) => {
    const totalSales = salesData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalProfit = salesData.reduce((acc, curr) => acc + curr.profit, 0);
    const avgOrderValue = totalSales / salesData.length;
    
    // Group by category
    const byCategory = categories.map(cat => ({
      name: cat,
      sales: salesData.filter(d => d.category === cat).reduce((acc, curr) => acc + curr.sales, 0),
      profit: salesData.filter(d => d.category === cat).reduce((acc, curr) => acc + curr.profit, 0),
    }));

    // Group by region
    const byRegion = regions.map(reg => ({
      name: reg,
      sales: salesData.filter(d => d.region === reg).reduce((acc, curr) => acc + curr.sales, 0),
    }));

    res.json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      orderCount: salesData.length,
      byCategory,
      byRegion
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
