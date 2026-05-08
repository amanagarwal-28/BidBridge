# BidBridge — Smart Freelancer Marketplace

A production-style full-stack freelancer marketplace where **clients post projects**, **freelancers bid**, and the platform manages **contracts, milestones, payments, and reviews**. Built with strong DBMS focus — schema, triggers, procedures, views, and transactions are all explicit and visible.

> Stack: Next.js 15 · React 18 · TypeScript · Tailwind CSS · shadcn/ui · Express · Prisma · MySQL · Zod · JWT

---

## ✨ Highlights

- **Three roles** — Client, Freelancer, Admin
- **Smart matching** — recommends freelancers ranked by skill overlap, ratings, and completed jobs
- **Milestone-based payments** — simulated, with audit trail
- **Auto contract generation** — atomic transaction when bid is accepted
- **Fraud detection** — daily bid limits + spam tracking
- **Strong DBMS layer** — 3NF schema, FKs, CHECK constraints, indexes, triggers, stored procedures, views
- **Modern dashboard UI** — role-aware sidebar, charts, tables, modals
- **Seeded demo data** — admin / clients / freelancers / projects / bids / contract preloaded

---

## 📁 Repo Layout

```
BidBridge/
├── backend/                    Node.js + Express + Prisma + MySQL
│   ├── prisma/
│   │   ├── schema.prisma       Prisma model definitions
│   │   └── sql/
│   │       ├── 01_schema.sql   Raw MySQL schema (3NF, indexed)
│   │       ├── 02_views.sql    DB views
│   │       ├── 03_procedures.sql  Stored procedures
│   │       └── 04_triggers.sql Triggers
│   └── src/
│       ├── config/             prisma client, env loader
│       ├── controllers/        request handlers
│       ├── middleware/         auth, error handling
│       ├── routes/             API route definitions
│       ├── services/           business logic
│       ├── validations/        Zod schemas
│       ├── utils/              jwt, response, pagination
│       ├── prisma/seed.ts      Demo data seed
│       ├── app.ts
│       └── server.ts
└── frontend/                   Next.js 15 + Tailwind + shadcn/ui
    ├── app/                    App-router pages (landing, auth, dashboard, admin)
    ├── components/             ui/ (shadcn) · layout · shared
    ├── services/               API clients
    ├── store/                  zustand auth store
    ├── lib/                    api, utils
    └── types/
```

---

## 🚀 Quick start

### 1 · Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- npm or pnpm

### 2 · Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set DATABASE_URL to your MySQL instance

# create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS bidbridge;"

# generate Prisma client + apply schema
npm run prisma:generate
npm run prisma:migrate -- --name init

# OPTIONAL: load raw SQL with views/procs/triggers
mysql -u root -p bidbridge < prisma/sql/02_views.sql
mysql -u root -p bidbridge < prisma/sql/03_procedures.sql
mysql -u root -p bidbridge < prisma/sql/04_triggers.sql

# load demo data
npm run seed

# start server
npm run dev   # http://localhost:5000
```

### 3 · Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

### 4 · Demo accounts

After `npm run seed`:

| Role        | Email                     | Password       |
|-------------|---------------------------|----------------|
| Admin       | admin@bidbridge.com       | Password123!   |
| Client      | client1@bidbridge.com     | Password123!   |
| Freelancer  | alex@bidbridge.com        | Password123!   |

---

## 🗄️ Database

### ER summary

- `users` — base auth table (1-1 with `clients`, `freelancers`, or `admins`)
- `clients` / `freelancers` / `admins` — role profiles
- `skills` — master skill list
- `freelancer_skills` (M:N), `project_skills` (M:N)
- `portfolio` — freelancer portfolio items
- `projects` — postings; FK → clients
- `bids` — UNIQUE(project_id, freelancer_id)
- `contracts` — 1-1 with project (auto-created on bid acceptance)
- `milestones`, `payments` — milestone-driven payment flow
- `reviews` — 1-1 with contracts (both sides can rate)
- `notifications` — in-app system notifications
- `fraud_reports` — flagged suspicious activity

### DBMS features in use

| Feature        | Where                                                              |
|----------------|--------------------------------------------------------------------|
| Normalization  | 3NF — every table modelled around its primary entity, no derived state stored where avoidable |
| Foreign keys   | All relations enforce cascade/restrict appropriately               |
| CHECK          | budget_max ≥ budget_min, ratings 0-5, hourly rate ≥ 0, etc.       |
| UNIQUE         | email, (project_id, freelancer_id), tx_ref, etc.                   |
| Indexes        | email, role, status, category, freelancer_id, etc.                 |
| Views          | `active_projects_view`, `top_freelancers_view`, `freelancer_earnings_view`, `project_bid_stats_view` |
| Stored procs   | `generate_contract`, `calculate_total_earnings`, `recommend_freelancers`, `mark_milestone_paid` |
| Triggers       | bid count update, payment-completed bookkeeping, contract-completed counter, review → avg rating, bid-received notification |
| Transactions   | bid accept (in `bid.service.ts` + raw SQL `generate_contract`), payment release, contract completion |

---

## 🔌 API summary

All routes prefixed with `/api`. JSON only. Auth via `Authorization: Bearer <token>`.

### Auth
- `POST /auth/signup` — { email, password, role, firstName, lastName }
- `POST /auth/login`
- `GET  /auth/me`

### Projects
- `GET    /projects` — public list with filters (`?category=…&search=…&status=OPEN`)
- `GET    /projects/:id`
- `POST   /projects` *(client)*
- `PUT    /projects/:id` *(client)*
- `DELETE /projects/:id` *(client)*
- `PUT    /projects/:id/close` *(client)*
- `GET    /projects/me/list` *(client)*
- `GET    /projects/:id/recommended` *(client)* — smart match
- `GET    /projects/:id/bids` *(client)*
- `POST   /projects/:projectId/bids` *(freelancer)*

### Bids / Contracts / Payments
- `GET  /bids/me` — *(freelancer)*
- `PUT  /bids/:id/accept|reject` — *(client)*
- `PUT  /bids/:id/withdraw` — *(freelancer)*
- `GET  /contracts/client/me` · `/contracts/freelancer/me` · `/contracts/:id`
- `POST /contracts/:id/milestones` · `PUT /contracts/:id/complete`
- `PUT  /milestones/:id/status`
- `POST /payments/contract/:id/initiate` · `PUT /payments/:id/complete`
- `GET  /payments/client/me` · `/payments/freelancer/me`

### Reviews / Users / Notifications / Admin
- `POST /reviews/:contractId` · `GET /reviews/freelancer/:id`
- `GET/PUT /users/freelancers/...` · `GET/PUT /users/clients/...` · `GET /users/skills`
- `GET /notifications` · `PUT /notifications/:id/read` · `PUT /notifications/read-all`
- `GET /admin/stats|analytics|users|projects|fraud-reports` (admin only)

Standard response shape:
```json
{ "success": true, "message": "...", "data": {...}, "meta": { "total": 100, "page": 1 } }
```

---

## 🎨 Frontend

### Pages
- `/` Landing — hero, how-it-works, features, testimonials, CTA
- `/login`, `/signup`
- `/dashboard` Role-aware home (client analytics or freelancer earnings)
- `/dashboard/projects` · `/projects/new` · `/projects/[id]`
- `/dashboard/contracts` · `/contracts/[id]` (with milestones + payments + review)
- `/dashboard/payments` *(client)* · `/dashboard/earnings` *(freelancer)*
- `/dashboard/browse` *(freelancer)* · `/dashboard/bids` *(freelancer)*
- `/dashboard/reviews` *(freelancer)* · `/dashboard/profile`
- `/admin` · `/admin/users` · `/admin/projects` · `/admin/fraud` · `/admin/analytics`

### Design
- White / soft-gray theme · blue primary (`hsl(217 91% 55%)`)
- Reusable shadcn-styled primitives (`Button`, `Card`, `Input`, `Dialog`, `Tabs`, `Select`, `Avatar`, `Badge`, `Skeleton`, `DropdownMenu`)
- Recharts for analytics (bar, line, pie)
- Sonner toast notifications
- Loading skeletons, hover transitions, smooth fade-in animations

---

## 🔒 Security

- bcrypt password hashing (12 rounds)
- JWT-based stateless auth · 7-day default expiry
- Helmet HTTP headers · CORS · cookie-parser
- Express rate limit (500 req / 15 min per IP)
- Zod input validation on every write endpoint
- Role-based middleware (`authorize('CLIENT')` etc.)
- Prisma parameterised queries (no SQL injection)

---

## 🧪 Testing the system

1. Sign up as a freelancer → fill profile + skills.
2. Sign up as a client → post a project tagged with skills.
3. Login as freelancer → browse projects → place a bid.
4. Login as client → review bids → accept → contract auto-created.
5. As client → add milestones → release payment.
6. As freelancer → submit milestone → check earnings.
7. As client → mark contract complete → leave review.
8. Login as admin → check stats, users, fraud reports, analytics.

---

## 📦 Scripts

### Backend
- `npm run dev` — start with nodemon
- `npm run build` — TypeScript build
- `npm run prisma:generate` · `prisma:migrate` · `prisma:studio`
- `npm run seed` — load demo data

### Frontend
- `npm run dev` · `npm run build` · `npm run start`

---

## 🧩 Architecture decisions

- **Prisma + raw SQL**: Prisma drives migrations and the application code; raw SQL files in `prisma/sql/` document the explicit DBMS layer (views, procs, triggers) required for the project. Both stay in sync.
- **Service-controller split**: business logic lives in `services/`, HTTP shape in `controllers/`. Easy to test in isolation.
- **Transactions where it matters**: bid acceptance, payment completion, and contract closure all run inside `prisma.$transaction` to keep counters and statuses consistent.
- **Frontend role-aware**: same `/dashboard` route renders different home views depending on role; sidebar items differ; protected routes redirect.

---

## License
MIT — for educational/academic use.
