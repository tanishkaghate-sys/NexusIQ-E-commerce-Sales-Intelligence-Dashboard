import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  PieChart as PieChartIcon,
  Map as MapIcon,
  Search
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency, formatNumber, cn } from "./lib/utils";
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface SalesData {
  id: string;
  date: string;
  category: string;
  region: string;
  segment: string;
  sales: number;
  profit: number;
  quantity: number;
}

interface Stats {
  totalSales: number;
  totalProfit: number;
  avgOrderValue: number;
  orderCount: number;
  byCategory: { name: string; sales: number; profit: number }[];
  byRegion: { name: string; sales: number }[];
}

// --- Components ---

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center text-xs font-medium px-2 py-1 rounded-full",
          trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </motion.div>
);

const ChartContainer = ({ title, children, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-slate-400" />}
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="flex gap-2">
        <button className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">Day</button>
        <button className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Month</button>
        <button className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors">Year</button>
      </div>
    </div>
    <div className="h-[300px] w-full min-h-[300px] relative">
      {children}
    </div>
  </div>
);

export default function App() {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [currentView, setCurrentView] = useState<'dashboard' | 'orders' | 'customers' | 'regional'>('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSales = sales.filter(s => 
    (filterCategory === "All" || s.category === filterCategory) &&
    (filterRegion === "All" || s.region === filterRegion)
  );

  const filteredStats = {
    totalSales: filteredSales.reduce((acc, curr) => acc + curr.sales, 0),
    totalProfit: filteredSales.reduce((acc, curr) => acc + curr.profit, 0),
    avgOrderValue: filteredSales.length > 0 ? filteredSales.reduce((acc, curr) => acc + curr.sales, 0) / filteredSales.length : 0,
    orderCount: filteredSales.length,
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, statsRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/stats")
      ]);
      const salesData = await salesRes.json();
      const statsData = await statsRes.json();
      setSales(salesData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsight = async () => {
    if (!stats) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Analyze this e-commerce sales data and provide 3 high-impact business insights.
        Total Sales: ${formatCurrency(stats.totalSales)}
        Total Profit: ${formatCurrency(stats.totalProfit)}
        Profit Margin: ${((stats.totalProfit / stats.totalSales) * 100).toFixed(1)}%
        Avg Order Value: ${formatCurrency(stats.avgOrderValue)}
        Categories: ${stats.byCategory.map(c => `${c.name} ($${c.sales})`).join(", ")}
        
        Format the response as a professional executive summary with bullet points. 
        Focus on growth opportunities and potential risks.
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setAiInsight(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error("AI Analysis failed", error);
      setAiInsight("AI Analysis is currently unavailable. Please check your API configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading NexusIQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-8 z-50 hidden md:flex">
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 cursor-pointer hover:scale-105 transition-transform"
        >
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={cn(
              "p-3 rounded-xl transition-all",
              currentView === 'dashboard' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            <BarChart3 className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentView('orders')}
            className={cn(
              "p-3 rounded-xl transition-all",
              currentView === 'orders' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            <ShoppingCart className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentView('customers')}
            className={cn(
              "p-3 rounded-xl transition-all",
              currentView === 'customers' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            <Users className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentView('regional')}
            className={cn(
              "p-3 rounded-xl transition-all",
              currentView === 'regional' ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
            )}
          >
            <MapIcon className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-20 p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {currentView === 'dashboard' && "NexusIQ"}
              {currentView === 'orders' && "Order Management"}
              {currentView === 'customers' && "Customer Insights"}
              {currentView === 'regional' && "Regional Performance"}
            </h1>
            <p className="text-slate-500">
              {currentView === 'dashboard' && "E-commerce Sales Intelligence Dashboard"}
              {currentView === 'orders' && "Detailed breakdown of all transactions"}
              {currentView === 'customers' && "Analyze customer segments and behavior"}
              {currentView === 'regional' && "Geographic distribution of sales and profit"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 px-3 py-1.5 focus:outline-none border-r border-slate-100"
              >
                <option value="All">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Furniture">Furniture</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
              <select 
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 px-3 py-1.5 focus:outline-none"
              >
                <option value="All">All Regions</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <button 
              onClick={generateAIInsight}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAnalyzing ? "Analyzing..." : "AI Insights"}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total Revenue" 
                  value={formatCurrency(filteredStats.totalSales)} 
                  trend={12.5} 
                  icon={DollarSign} 
                  color="bg-indigo-500" 
                />
                <StatCard 
                  title="Total Profit" 
                  value={formatCurrency(filteredStats.totalProfit)} 
                  trend={8.2} 
                  icon={TrendingUp} 
                  color="bg-emerald-500" 
                />
                <StatCard 
                  title="Total Orders" 
                  value={formatNumber(filteredStats.orderCount)} 
                  trend={-2.4} 
                  icon={ShoppingCart} 
                  color="bg-amber-500" 
                />
                <StatCard 
                  title="Avg. Order Value" 
                  value={formatCurrency(filteredStats.avgOrderValue)} 
                  trend={4.1} 
                  icon={Package} 
                  color="bg-rose-500" 
                />
              </div>

              {/* AI Insights Panel */}
              <AnimatePresence>
                {aiInsight && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                  >
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-300" />
                            <h3 className="text-lg font-bold">AI Business Intelligence</h3>
                          </div>
                          <button onClick={() => setAiInsight(null)} className="text-indigo-300 hover:text-white transition-colors">Dismiss</button>
                        </div>
                        <div className="prose prose-invert max-w-none text-indigo-100 text-sm leading-relaxed whitespace-pre-line">
                          {aiInsight}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <ChartContainer title="Revenue Trends" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredSales.slice(-30)}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          tick={{ fontSize: 10, fill: '#94A3B8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tickFormatter={(val) => `$${val}`}
                          tick={{ fontSize: 10, fill: '#94A3B8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Sales']}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div>
                  <ChartContainer title="Sales by Category" icon={PieChartIcon}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.byCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="sales"
                        >
                          {stats?.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatCurrency(val), 'Sales']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      {stats?.byCategory.map((cat, i) => (
                        <div key={cat.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b'][i % 3] }} />
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </ChartContainer>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-bottom border-slate-50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
                  <button onClick={() => setCurrentView('orders')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Region</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sales</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSales.slice(-10).reverse().map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{order.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">{order.category}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{order.region}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(order.sales)}</td>
                          <td className={cn(
                            "px-6 py-4 text-sm font-medium",
                            order.profit > 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {order.profit > 0 ? "+" : ""}{formatCurrency(order.profit)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-xs font-medium text-emerald-600">Completed</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-semibold text-slate-800">All Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profit</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSales.slice().reverse().map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">{order.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{order.region}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(order.sales)}</td>
                        <td className={cn(
                          "px-6 py-4 text-sm font-medium",
                          order.profit > 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {formatCurrency(order.profit)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{order.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {currentView === 'customers' && (
            <motion.div 
              key="customers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Customer Segments</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Consumer', value: filteredSales.filter(s => s.segment === 'Consumer').length },
                        { name: 'Corporate', value: filteredSales.filter(s => s.segment === 'Corporate').length },
                        { name: 'Home Office', value: filteredSales.filter(s => s.segment === 'Home Office').length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Sales by Segment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Consumer', sales: filteredSales.filter(s => s.segment === 'Consumer').reduce((a, b) => a + b.sales, 0) },
                    { name: 'Corporate', sales: filteredSales.filter(s => s.segment === 'Corporate').reduce((a, b) => a + b.sales, 0) },
                    { name: 'Home Office', sales: filteredSales.filter(s => s.segment === 'Home Office').reduce((a, b) => a + b.sales, 0) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {currentView === 'regional' && (
            <motion.div 
              key="regional"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Regional Performance Breakdown</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats?.byRegion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="md:ml-20 p-8 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">NexusIQ</span>
          </div>
          <p className="text-slate-400 text-xs">© 2026 Nexus Intelligence Systems. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-medium text-slate-500 hover:text-indigo-600">Documentation</a>
            <a href="#" className="text-xs font-medium text-slate-500 hover:text-indigo-600">API Reference</a>
            <a href="#" className="text-xs font-medium text-slate-500 hover:text-indigo-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
