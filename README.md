# PACKAGE-DOWNLOAD-STAT

A beautiful package download statistics viewer for **npm** and **PyPI** packages built with Next.js, shadcn/ui, Tailwind CSS, and Framer Motion. View download statistics for any npm or PyPI package with interactive charts and detailed package information.

![NPM Package Download Statistics](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🔄 **Dual Package Manager Support** - Switch between npm and PyPI packages
- 🔍 **Search Packages** - Search for any npm or PyPI package by name
- 📊 **Interactive Charts** - Visualize download statistics with beautiful charts
- 📅 **Custom Date Ranges** - View stats for 7 days, 30 days, 90 days, 1 year, or custom dates (npm)
- 📈 **Multiple Views** - Switch between Daily, Weekly, Monthly, and Yearly chart views (npm) or Day/Week/Month (PyPI)
- 👤 **Author Information** - View package author details and maintainers
- 📖 **README Display** - Full markdown README rendering with syntax highlighting
- 🌓 **Dark/Light Theme** - Toggle between dark and light themes
- ✨ **Smooth Animations** - Beautiful Framer Motion animations throughout
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

## 🚀 Live Demo

Visit the live application: [https://npm-package-download-stat.vercel.app](https://npm-package-download-stat.vercel.app)

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **Recharts** - Interactive chart library
- **React Markdown** - Markdown rendering
- **npm Public API** - npm package download data
- **PyPI Stats API** - PyPI package download statistics

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Clone the Repository

```bash
git clone https://github.com/gautammanak1/npm-package-download-stat.git
cd npm-package-download-stat
```

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## 🏃 Running Locally

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🚢 Deployment

### Deploy to Vercel via CI/CD Only

This project uses **CI/CD pipeline only** for deployments. Vercel automatic builds are disabled.

#### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `gautammanak1/npm-package-download-stat`
4. Vercel will auto-detect Next.js settings
5. Click **"Deploy"** (this will do initial deployment)

#### Step 2: Disable Automatic Builds in Vercel

**Important**: After initial deployment, disable automatic builds:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Git**
3. Under **"Production Branch"**, find **"Automatic deployments"**
4. **Disable** automatic deployments by toggling it off
5. Or go to **Settings > Git > Deploy Hooks** and disable automatic deployments

**Alternative Method**:

- Go to **Settings > Git**
- Scroll to **"Deploy Hooks"**
- Disable automatic deployments for `main` branch

#### Step 3: Setup GitHub Secrets for CI/CD

1. Get Vercel credentials:
   - **Vercel Token**: [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - **Organization ID**: [Vercel Settings > General](https://vercel.com/account/general) (Team ID)
   - **Project ID**: Project Settings > General (Project ID)

2. Add GitHub Secrets:
   - Go to repository **Settings > Secrets and variables > Actions**
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

#### Step 4: Enable GitHub Actions

1. Repository **Settings > Actions > General**
2. Under **"Workflow permissions"**:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

#### CI/CD Pipeline

The project uses GitHub Actions for all deployments:

- **On Push to Main**: Automatically deploys to Vercel production via CI/CD
- **On Pull Request**: Creates preview deployment via CI/CD
- **Build Status**: Shows build status in GitHub Actions

**Note**: All deployments now happen through CI/CD only. Vercel won't auto-build on git push.

### Environment Variables

No environment variables are required for this project as it uses public npm APIs.

## 📖 Usage

### For npm Packages:

1. **Select npm**: Click the "npm" button in the header
2. **Search Package**: Enter an npm package name (e.g., `react`, `lodash`, `express`)
3. **View Statistics**: Click "Search" or press Enter to view download statistics
4. **Explore Charts**: Switch between Daily, Weekly, Monthly, and Yearly views using tabs
5. **Custom Date Range**: Use quick buttons (7 days, 30 days, etc.) or select custom dates
6. **View Details**: Check author information, maintainers, and README

### For PyPI Packages:

1. **Select PyPI**: Click the "PyPI" button in the header
2. **Search Package**: Enter a PyPI package name (e.g., `requests`, `numpy`, `pandas`)
3. **View Statistics**: Click "Search" or press Enter to view download statistics
4. **Explore Charts**: Switch between Day, Week, and Month views using period buttons
5. **View Details**: Check author information, homepage, and package description

## 🔌 API

This project uses public APIs for both package managers:

### npm API:

- **Download Statistics**: `https://api.npmjs.org/downloads/range/{start}:{end}/{package}`
- **Package Info**: `https://registry.npmjs.org/{package}`

### PyPI API:

- **Download Statistics**: `https://pypistats.org/api/packages/{package}/recent`
- **Overall Downloads**: `https://pypistats.org/api/packages/{package}/overall`
- **Package Info**: `https://pypi.org/pypi/{package}/json`

No API keys required - all endpoints are public.

## 📁 Project Structure

```
npm-package-download-stat/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── author-info.tsx      # Author information component
│   ├── download-chart.tsx   # Chart component
│   ├── readme-viewer.tsx    # README viewer component
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Theme toggle button
├── lib/
│   ├── npm-api.ts           # npm API integration
│   └── utils.ts             # Utility functions
├── .github/
│   └── workflows/
│       └── vercel.yml       # CI/CD pipeline
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Gautam Manak**

- Website: [https://gautammanak.vercel.app](https://gautammanak.vercel.app)
- GitHub: [@gautammanak1](https://github.com/gautammanak1)

## 🙏 Acknowledgments

- [npm](https://www.npmjs.com/) for the public API
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Vercel](https://vercel.com/) for hosting and deployment

---

Made with ❤️ by [Gautam Manak](https://gautammanak.vercel.app)
