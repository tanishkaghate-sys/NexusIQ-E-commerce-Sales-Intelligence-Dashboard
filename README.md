# NexusIQ – E-commerce Sales Intelligence Dashboard

NexusIQ is a full-stack Business Intelligence (BI) dashboard that transforms raw e-commerce sales data into actionable insights through interactive visualizations and AI-driven analysis.

---

## Features

- Real-time sales analytics (Revenue, Profit, Orders, AOV)
- Dynamic filtering by region and product category
- Interactive charts (Area, Pie) for trend analysis
- AI-powered “Smart Insights” for automated business summaries
- Fast and responsive UI with smooth animations
- Custom REST API for data and KPI delivery

---

## Key Insights Delivered

- Identification of top-performing categories and regions  
- Detection of loss-making segments  
- Revenue and profit trend analysis  
- AI-generated business recommendations  

---

## Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 19** | Component-based SPA framework for fast, modular UI |
| **TypeScript** | Type-safe development — standard for professional data roles |
| **Tailwind CSS** | Modern "Technical Dashboard" aesthetic with responsive design |
| **Framer Motion** | Smooth view transitions and high-end animations |
| **Lucide React** | Professional, consistent icon library |

### Data Visualization
| Technology | Role |
|---|---|
| **Recharts** (built on D3.js) | Interactive Area Charts and Pie Charts with filter reactivity |

### AI & Intelligence
| Technology | Role |
|---|---|
| **Google Gemini API** | Automated business insight generation and growth recommendations |

### Backend & Data API
| Technology | Role |
|---|---|
| **Node.js + Express** | Custom REST API — serves sales data and pre-computed statistics |
| **tsx** | High-performance TypeScript execution in the Node environment |

### Data Logic
| Technology | Role |
|---|---|
| **Advanced JavaScript** | `.reduce()`, `.filter()`, `.map()` for KPI aggregation (equivalent to SQL/Pandas) |

## Project Structure
```
NexusIQ-Dashboard/
│
├── node_modules/        # Installed dependencies
│
├── src/
│   ├── lib/             # Utility/helper functions (if used)
│   ├── App.tsx          # Main dashboard component
│   ├── index.css        # Global styles
│   ├── main.tsx         # Entry point
│
├── .env                 # Environment variables (DO NOT PUSH)
├── .gitignore           # Ignored files
├── index.html           # Root HTML file
├── metadata.json        # App metadata/config
├── package.json         # Project dependencies & scripts
├── package-lock.json    # Dependency lock file
├── README.md            # Documentation
├── server.ts            # Backend/API server
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
```
###  API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sales` | Full sales dataset (filterable by region & category) |
| `GET` | `/api/sales/kpis` | Computed KPIs — total revenue, profit, top performers |
| `GET` | `/api/sales/trends` | Revenue and profit trends over time |
| `GET` | `/api/sales/by-region` | Sales aggregated by region |
| `GET` | `/api/sales/by-category` | Sales aggregated by product category |
| `POST` | `/api/insights` | Sends filtered data to Gemini API, returns AI summary |

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nexusiq-dashboard
```
### 2.Navigate to project
```bash
cd nexusiq-dashboard
```
### 3.Install dependencies
```bash
npm install
```
### 4. Start the development server
```bash
npm run dev
```
