# ELTGRUP Manager — Architecture

**Version:** 0.3.1 | **Stack:** Next.js 16 + React 19 + Prisma 6 + PostgreSQL | **Auth:** NextAuth v4 (Credentials + JWT)

---

## 1. Directory Structure

```
app/                          # Next.js App Router
├── (app)/                    # Authenticated routes
│   ├── panou/                # Dashboard (widgets, KPI, activity)
│   ├── proiecte/             # Projects (list + [id]/detail)
│   ├── lucrari/              # Work orders (list + [id]/detail)
│   ├── calendar/             # Planning calendar
│   ├── pontaj/               # Time tracking
│   ├── materiale/            # Materials (with ?tab=scule&tab=echipamente)
│   ├── echipamente/          # Redirect → /materiale?tab=echipamente
│   ├── gestiune-scule/       # Redirect → /materiale?tab=scule
│   ├── documente/            # Documents
│   ├── clienti/              # Clients
│   ├── oferte/               # Offers
│   ├── rapoarte-zilnice/     # Daily site reports
│   ├── subcontractori/       # Subcontractors
│   ├── financiar/            # Financial (invoices, costs)
│   ├── notificari/           # Notifications
│   ├── setari/               # Settings (with ?tab=activitate)
│   ├── teren/                # Redirect → /lucrari?filter=teren
│   ├── analitice/            # Redirect → /panou
│   ├── echipe/               # Teams
│   ├── echipamente/          # Equipment (redirect)
│   ├── facturi/              # Invoices (standalone)
│   └── layout.tsx            # Auth check + sidebar + topbar
├── (auth)/                   # Public auth routes
│   └── autentificare/        # Login page
├── api/                      # API routes
│   ├── auth/[...nextauth]/   # NextAuth handler
│   ├── export/               # CSV/PDF exports
│   ├── documents/            # File download
│   ├── cron/                 # Scheduled tasks
│   └── checklist-templates/  # Template CRUD
├── globals.css               # Theme (dark + light), Tailwind v4
└── layout.tsx                # Root layout (fonts, providers, theme)

src/
├── lib/                      # Core logic
│   ├── auth.ts               # NextAuth config (JWT, role sync)
│   ├── prisma.ts             # Prisma singleton + soft-delete interceptor
│   ├── rbac.ts               # Role/permission matrix (10 roles, 11 resources, 7 actions)
│   ├── permissions.ts        # requirePermission() gate
│   ├── access-control.ts     # Module/route-level RBAC
│   ├── access-scope.ts       # Dynamic project scope (PM, worker, client, sub)
│   ├── safe-action.ts        # Server action wrapper (auth → validate → log)
│   ├── rate-limit.ts         # In-memory rate limiter
│   ├── activity-log.ts       # Audit trail with sensitive field redaction
│   ├── storage.ts            # File upload (S3 or local fallback)
│   ├── notifications.ts      # In-app notification dispatch
│   ├── constants.ts          # STANDARD_SHIFT_END_HOUR, pagination defaults
│   ├── shared-helpers.ts     # assertActiveProjectAccess, loadActiveWorkOrder
│   ├── fgo.ts                # eFactura ANAF (FGO) integration
│   ├── utils.ts              # cn(), formatCurrency, formatDate, fullName
│   └── *.test.ts             # Unit tests (9 files)
├── components/
│   ├── auth/                 # PermissionGuard, SignOutButton
│   ├── dashboard/            # ProfitabilityChart, ScheduleTable
│   ├── forms/                # FormModal, ConfirmSubmitButton
│   ├── layout/               # Sidebar, Topbar, CommandPalette, MobileNavDrawer
│   │                         # NavigationConfig, KeyboardShortcuts
│   ├── providers/            # HeroUI, ReactQuery, ThemeProvider
│   └── ui/                   # Button, Input, Card, Badge, Table, Dialog, etc.
│                             # Breadcrumbs, Stagger, PageSkeletons
├── services/
│   └── project.service.ts    # ProjectService (create with retry, soft-delete)
├── modules/
│   └── dashboard/charts.tsx  # ProductivityChart (recharts)
└── types/
    └── next-auth.d.ts        # Session/User/JWT type augmentation

prisma/
├── schema.prisma             # 37 models, 27 enums
├── migrations/               # 16 migrations
├── seed.ts                   # 3 modes: safe, bootstrap, demo
└── config.ts                 # Prisma config

proxy.ts                      # Edge middleware (auth check → RBAC → redirect)
next.config.ts                # Security headers, CSP, image optimization
```

---

## 2. Security Architecture — Multi-Layer Defense

```
Layer 1: Edge (proxy.ts)
├── Matches all non-public routes
├── Reads JWT via next-auth/jwt getToken()
├── Redirects unauthenticated → /autentificare
└── Checks canAccessPath() → redirects unauthorized → first visible module

Layer 2: Server Action (safe-action.ts)
├── requirePermission() → reads session, normalizes roles, checks matrix
├── If no permission → throws error with Romanian message
└── Logs to ActivityLog on success

Layer 3: Scope (access-scope.ts)
├── resolveAccessScope(user) → projectIds: string[] | null
├── PM/SM → their managed projects
├── Worker → projects from assigned work orders + team
├── Client → projects where email matches
├── Subcontractor → assigned projects
└── Privileged roles → null (unrestricted)

Layer 4: Audit (activity-log.ts)
├── Every create/update/delete logs to ActivityLog
├── Sensitive fields redacted (password, token, key, secret)
└── Entity-type indexed for fast timeline queries
```

### RBAC Matrix

| Role | Modules | Key Restrictions |
|------|---------|-----------------|
| SUPER_ADMIN | All (full CRUD+MANAGE) | None |
| ADMINISTRATOR | All (full CRUD+MANAGE) | None |
| PROJECT_MANAGER | Offers, Projects, Tasks, Teams, Time, Docs, Invoices, Reports | No SETTINGS, no USERS |
| SITE_MANAGER | Projects, Tasks, Teams, Time, Docs, Reports | No INVOICES, no SETTINGS |
| MAGAZIONER | Materials (full), Documents (create), Reports (view) | Read-only on projects/tasks |
| BACKOFFICE | Offers, Projects, Tasks, Teams, Time, Docs, Reports | No INVOICES, no SETTINGS |
| WORKER | Tasks (update), Time (create), Docs (create), Reports (create) | Read-only on materials |
| ACCOUNTANT | Projects (view), Invoices (full), Reports, Time (export) | No SETTINGS |
| CLIENT_VIEWER | Projects (view), Docs (view), Invoices (view), Reports (view) | Read-only |
| SUBCONTRACTOR | Tasks (update), Docs (create), Reports (create) | Scoped to assigned | 

---

## 3. Data Flow

```
Request → proxy.ts (edge)
  ├── Public route? → NextResponse.next()
  └── Protected route?
      ├── No JWT → redirect /autentificare?callbackUrl=...
      └── JWT valid?
          ├── canAccessPath() = false → redirect first visible module
          └── canAccessPath() = true → NextResponse.next() → App Router

Server Action (form submit):
  formData → createSafeAction()
    ├── 0. Rate limit check (60 req/min per action type)
    ├── 1. requirePermission(resource, action) → auth + RBAC check
    ├── 2. Zod schema validation → fromZodError() on failure
    ├── 3. Access scope assertion (assertProjectAccess, etc.)
    ├── 4. Handler execution (DB write via Prisma)
    ├── 5. Activity logging (with diff, redacted sensitive fields)
    ├── 6. Notification dispatch (notifyRoles / notifyUser)
    └── 7. revalidatePath() for affected routes

Page Load (RSC):
  Page component → auth() → resolveAccessScope() → Prisma queries
    ├── Data fetched with scope filters (projectScopeWhere, etc.)
    ├── PermissionGuard wraps critical sections
    └── Suspense boundaries for async data
```

---

## 4. Theme System

```
CSS Variables (globals.css):
  :root → dark theme (default)
  [data-theme="light"] → light theme (toggle in sidebar, persisted in localStorage)
  
All components use:
  var(--color) for direct references
  color-mix(in oklab, var(--color) X%, transparent) for alpha variants
  No hardcoded hex/rgba anywhere

ThemeProvider (React context):
  Reads localStorage('theme') on mount
  Sets data-theme attribute on <html>
  Toggle button in sidebar footer
  Respects prefers-reduced-motion
```

---

## 5. Database

**Provider:** PostgreSQL (hosted on dedicated server or Supabase)
**ORM:** Prisma 6 with soft-delete extension

**37 Models** organized in groups:
| Group | Models |
|-------|--------|
| Auth | User, Role, Permission, RolePermission, UserRole, Account, Session, VerificationToken |
| Core | Project, ProjectPhase, WorkOrder, TaskChecklistItem |
| HR | WorkerProfile, Team, Attendance, TimeEntry |
| Materials | Material, Warehouse, StockMovement, MaterialRequest, ProjectMaterialUsage |
| Inventory | InventoryCategory, InventoryLocation, InventoryItem, InventoryAssignment, InventoryMovement, InventoryInspectionRecord |
| Equipment | Equipment, EquipmentAssignment |
| Commercial | Client, ClientContact, Offer, OfferItem, Subcontractor, SubcontractorAssignment |
| Financial | Invoice, CostEntry |
| Documents | Document |
| Field | DailySiteReport |
| Permits | PermitApplication, InstallationInspection, ProjectInstallation, ChecklistTemplate |
| System | Notification, Comment, ActivityLog |

---

## 6. Performance Optimizations

- **Prisma connection pool:** 10 concurrent connections (configurable via DATABASE_CONNECTION_LIMIT)
- **Soft-delete interceptor:** findMany/findFirst/count/findFirstOrThrow auto-filter deletedAt
- **React cache:** auth() and resolveAccessScope() cached per request
- **Dynamic imports:** recharts (ProductivityChart) loaded via next/dynamic with ssr:false
- **Optimized package imports:** @heroui/react, recharts, lucide-react, @radix-ui/* in next.config.ts
- **Dashboard queries:** Promise.all for parallel DB fetches
- **TanStack Query:** staleTime 60s, gcTime 5min, retry:1
- **Memoization:** KpiCard, ProductivityChart, search indexing memoized

---

## 7. Testing Strategy

- **Unit (Vitest):** 9 test files (access-control, fgo, inventory, query-params, rbac, etc.)
  - Coverage thresholds: statements 30%, branches 20%, functions 25%, lines 30%
- **E2E (Playwright):** Login, Dashboard, RBAC, Responsive, Security specs
  - Cross-browser: Chromium + Mobile Chrome (Pixel 5)
  - Auth state persistence via storageState
  - Videos + screenshots on failure
