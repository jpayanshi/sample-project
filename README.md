# Why label?

A full-stack clothing e-commerce store. Built to explore what it takes to ship a real product — not just a tutorial app.

> *"Can't even the most luxurious label match quality. Just want to sell clothes with original threads not with plastic."*

---

## What's inside

A monorepo with three workspaces:

```
/
├── backend/       Express API + Prisma + PostgreSQL
├── frontend/      Next.js 14 App Router
└── e2e/           Playwright end-to-end tests
```

---

## Features

**For shoppers**
- Browse products, filter by category
- Size and colour variant selection with live stock checks
- Persistent cart (guest session or logged-in)
- Checkout with address form and Stripe payment integration
- Order history with full item breakdown
- Account settings — name, phone, saved addresses

**For admins**
- Product management (view, delete)
- Order management — view all orders, update status
- Admin-only routes protected both on the frontend and at the API level

**Auth**
- Register / login / logout
- JWT stored in an HTTP-only cookie
- Role-based access (`CUSTOMER` / `ADMIN`)
- Protected routes redirect unauthenticated users to login

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS |
| State / data fetching | TanStack React Query v5 |
| Forms | react-hook-form + Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (HTTP-only cookie) |
| Payments | Stripe |
| Media | Cloudinary |
| Email | Resend |
| Testing | Playwright |

---

## Getting started

### Prerequisites
- Node.js 18+
- Yarn
- PostgreSQL running locally
- (Optional) Redis, Stripe account, Cloudinary account

### 1. Clone and install

```bash
git clone https://github.com/jpayanshi/sample-project.git
cd sample-project
yarn install
```

### 2. Configure environment variables

**Backend** — copy and fill in `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clothing_db"
JWT_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

**Frontend** — copy and fill in `frontend/.env.example`:
```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Set up the database

```bash
# Run migrations
yarn db:migrate

# Seed with products, users, and sample orders
yarn workspace backend prisma db seed
```

This creates:
- 20 products across multiple categories
- An admin account: `admin@store.com` / `admin123`
- A customer account: `customer1@test.com` / `password123`

### 4. Run the development servers

```bash
# Backend (port 4000)
yarn dev:backend

# Frontend (port 3000) — in a separate terminal
yarn dev:frontend
```

Open [http://localhost:3000](http://localhost:3000).

---

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | — | Logout (clears cookie) |
| GET | `/api/auth/me` | ✓ | Get current user |
| PUT | `/api/auth/profile` | ✓ | Update name / phone |
| GET | `/api/products` | — | List products (filterable) |
| GET | `/api/products/:slug` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/cart` | — | Get cart |
| POST | `/api/cart/items` | — | Add item |
| PUT | `/api/cart/items/:id` | — | Update quantity |
| DELETE | `/api/cart/items/:id` | — | Remove item |
| GET | `/api/orders` | ✓ | My orders |
| POST | `/api/orders` | ✓ | Place order |
| GET | `/api/addresses` | ✓ | My addresses |
| POST | `/api/addresses` | ✓ | Add address |
| DELETE | `/api/addresses/:id` | ✓ | Delete address |
| GET | `/api/admin/orders` | Admin | All orders |
| PUT | `/api/admin/orders/:id` | Admin | Update order status |

---

## Running tests

The E2E suite requires both servers running and the database seeded (the global setup handles seeding automatically).

```bash
cd e2e
npm test                  # headless
npm run test:headed       # watch it run in a browser
npm run test:ui           # Playwright UI mode
npm run test:report       # open last HTML report
```

15 tests covering auth, product browsing, cart, checkout, and admin flows.

---

## Project structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
└── src/
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth, validation, error handling
    ├── routes/             # Express routers
    ├── schemas/            # Zod validation schemas
    ├── services/           # Business logic (cart merging etc.)
    └── utils/              # JWT, password hashing, async wrapper

frontend/
└── src/
    ├── app/                # Next.js App Router pages
    │   ├── account/        # Customer account (settings + orders)
    │   ├── admin/          # Admin dashboard (products + orders)
    │   ├── auth/           # Login + register
    │   ├── cart/           # Cart page
    │   ├── checkout/       # Checkout page
    │   ├── products/       # Product detail
    │   └── shop/           # Product listing
    ├── components/         # Shared UI components
    ├── lib/                # Axios client + API methods
    ├── providers/          # React Query + Cart providers
    ├── schemas/            # Zod form schemas
    └── types/              # TypeScript interfaces
```

---

## What's not done yet

- Stripe Elements fully wired in checkout (currently a placeholder)
- Address selection step in checkout flow
- Product create / edit UI in admin panel
- Email notifications via Resend
- Image uploads via Cloudinary

---

## Useful commands

```bash
yarn db:migrate       # Run Prisma migrations
yarn db:studio        # Open Prisma Studio (database GUI)
yarn build:backend    # Compile backend TypeScript
yarn build:frontend   # Next.js production build
```
