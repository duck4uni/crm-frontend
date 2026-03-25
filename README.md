# CRM Frontend - Customer Relationship Management System

A modern, feature-rich CRM (Customer Relationship Management) system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard** - Overview of key metrics, revenue, and deals
- 👥 **Contacts Management** - Track and manage customer contacts
- 🏢 **Companies** - Organize and manage company relationships
- 💰 **Deals Pipeline** - Track sales opportunities through various stages
- ✅ **Task Management** - Organize and track tasks with priorities
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔒 **Type-Safe** - Built with TypeScript for robust code

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand (ready to use)
- **Icons:** React Icons (Feather Icons)
- **Date Handling:** date-fns

## Project Structure

```
crm-frontend/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard layout group
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard home page
│   │   ├── contacts/            # Contacts module
│   │   ├── companies/           # Companies module
│   │   ├── deals/               # Deals module
│   │   ├── tasks/               # Tasks module
│   │   └── settings/            # Settings module
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── Spinner.tsx
│   └── layout/                  # Layout components
│       ├── Sidebar.tsx
│       └── Header.tsx
├── types/                       # TypeScript type definitions
│   ├── index.ts                 # Core types (Contact, Company, Deal, Task)
│   ├── dashboard.ts             # Dashboard-specific types
│   └── api.ts                   # API and pagination types
├── services/                    # API service layers
│   ├── contacts.ts
│   ├── companies.ts
│   ├── deals.ts
│   ├── tasks.ts
│   └── dashboard.ts
├── lib/                         # Utility functions and helpers
│   ├── utils.ts                 # Common utilities (formatters, helpers)
│   ├── mock-data.ts             # Mock data for development
│   └── api-client.ts            # API client wrapper
└── public/                      # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd crm-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update environment variables in `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features Overview

### Dashboard

- Real-time statistics (contacts, companies, deals, tasks)
- Revenue overview with monthly breakdown
- Deals pipeline visualization by stage
- Quick stats for deals won and tasks

### Contacts

- List and search contacts
- Contact cards with company information
- Status badges and tags
- Creation and last contact tracking

### Companies

- Company directory with details
- Industry and size information
- Contact information (website, email, phone)
- Status tracking and tagging

### Deals

- Sales pipeline management
- Deal stages (Prospecting → Negotiation → Closed)
- Value tracking with currency support
- Probability and expected close dates

### Tasks

- Task management with priorities (Low, Medium, High, Urgent)
- Status tracking (To Do, In Progress, Completed)
- Due date management
- Related to contacts, companies, or deals

## Architecture Highlights

### Type Safety

- Comprehensive TypeScript types for all entities
- Type-safe API client
- Strict mode enabled

### Component Structure

- Reusable UI components in `components/ui/`
- Layout components for consistent structure
- Client and Server Components appropriately used

### Service Layer

- Separated API logic in `services/`
- Centralized API client with error handling
- Ready for backend integration

### Styling

- Tailwind CSS for utility-first styling
- Custom color palette for brand consistency
- Responsive design for all screen sizes

## Customization

### Colors

Update the color scheme in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Your custom colors
  },
}
```

### Add New Features

1. Create types in `types/`
2. Create service in `services/`
3. Add route in `app/(dashboard)/`
4. Update navigation in `components/layout/Sidebar.tsx`

## Backend Integration

The app is ready for API integration:

1. Update `NEXT_PUBLIC_API_URL` in `.env`
2. Services in `services/` folder will connect to your backend
3. Remove mock data from `lib/mock-data.ts` once API is ready
4. Update service methods as needed for your API structure

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.
