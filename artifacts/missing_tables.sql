--
-- PostgreSQL database dump
--

\restrict wnU2GlwhzNbYPdNKmjUZPylh8Jn8OolfuBac7N4BJya14G8CSmmaLogAsgI95sw

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3 (Debian 18.3-1+b1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_teamId_fkey";
ALTER TABLE IF EXISTS ONLY public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_responsibleId_fkey";
ALTER TABLE IF EXISTS ONLY public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_phaseId_fkey";
ALTER TABLE IF EXISTS ONLY public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_approvedById_fkey";
ALTER TABLE IF EXISTS ONLY public."TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_workOrderId_fkey";
ALTER TABLE IF EXISTS ONLY public."TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_approvedById_fkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_warehouseId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_materialId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."MaterialRequest" DROP CONSTRAINT IF EXISTS "MaterialRequest_requestedById_fkey";
ALTER TABLE IF EXISTS ONLY public."MaterialRequest" DROP CONSTRAINT IF EXISTS "MaterialRequest_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."MaterialRequest" DROP CONSTRAINT IF EXISTS "MaterialRequest_materialId_fkey";
ALTER TABLE IF EXISTS ONLY public."MaterialRequest" DROP CONSTRAINT IF EXISTS "MaterialRequest_approvedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_workOrderId_fkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_uploadedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_clientId_fkey";
ALTER TABLE IF EXISTS ONLY public."CostEntry" DROP CONSTRAINT IF EXISTS "CostEntry_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."CostEntry" DROP CONSTRAINT IF EXISTS "CostEntry_approvedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_teamId_fkey";
DROP INDEX IF EXISTS public."WorkOrder_teamId_startDate_idx";
DROP INDEX IF EXISTS public."WorkOrder_projectId_status_idx";
DROP INDEX IF EXISTS public."WorkOrder_dueDate_priority_idx";
DROP INDEX IF EXISTS public."TimeEntry_userId_startAt_idx";
DROP INDEX IF EXISTS public."TimeEntry_userId_liveState_endAt_idx";
DROP INDEX IF EXISTS public."TimeEntry_projectId_status_idx";
DROP INDEX IF EXISTS public."StockMovement_warehouseId_movedAt_idx";
DROP INDEX IF EXISTS public."StockMovement_materialId_type_idx";
DROP INDEX IF EXISTS public."Notification_userId_isRead_createdAt_idx";
DROP INDEX IF EXISTS public."MaterialRequest_requestedAt_idx";
DROP INDEX IF EXISTS public."MaterialRequest_projectId_status_idx";
DROP INDEX IF EXISTS public."Invoice_status_dueDate_idx";
DROP INDEX IF EXISTS public."Invoice_projectId_idx";
DROP INDEX IF EXISTS public."Invoice_invoiceNumber_key";
DROP INDEX IF EXISTS public."Equipment_code_key";
DROP INDEX IF EXISTS public."Document_projectId_category_idx";
DROP INDEX IF EXISTS public."Document_expiresAt_idx";
DROP INDEX IF EXISTS public."CostEntry_projectId_type_idx";
DROP INDEX IF EXISTS public."CostEntry_occurredAt_idx";
DROP INDEX IF EXISTS public."Attendance_userId_date_key";
DROP INDEX IF EXISTS public."Attendance_date_teamId_idx";
ALTER TABLE IF EXISTS ONLY public."WorkOrder" DROP CONSTRAINT IF EXISTS "WorkOrder_pkey";
ALTER TABLE IF EXISTS ONLY public."TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_pkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_pkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."MaterialRequest" DROP CONSTRAINT IF EXISTS "MaterialRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_pkey";
ALTER TABLE IF EXISTS ONLY public."Equipment" DROP CONSTRAINT IF EXISTS "Equipment_pkey";
ALTER TABLE IF EXISTS ONLY public."Document" DROP CONSTRAINT IF EXISTS "Document_pkey";
ALTER TABLE IF EXISTS ONLY public."CostEntry" DROP CONSTRAINT IF EXISTS "CostEntry_pkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_pkey";
DROP TABLE IF EXISTS public."WorkOrder";
DROP TABLE IF EXISTS public."TimeEntry";
DROP TABLE IF EXISTS public."StockMovement";
DROP TABLE IF EXISTS public."Notification";
DROP TABLE IF EXISTS public."MaterialRequest";
DROP TABLE IF EXISTS public."Invoice";
DROP TABLE IF EXISTS public."Equipment";
DROP TABLE IF EXISTS public."Document";
DROP TABLE IF EXISTS public."CostEntry";
DROP TABLE IF EXISTS public."Attendance";
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "teamId" text,
    date timestamp(3) without time zone NOT NULL,
    "checkInAt" timestamp(3) without time zone,
    "checkOutAt" timestamp(3) without time zone,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    "gpsLatitude" numeric(10,7),
    "gpsLongitude" numeric(10,7),
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CostEntry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CostEntry" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    type public."CostType" NOT NULL,
    description text NOT NULL,
    amount numeric(14,2) NOT NULL,
    "occurredAt" timestamp(3) without time zone NOT NULL,
    "approvedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Document; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "projectId" text,
    "clientId" text,
    category public."DocumentCategory" NOT NULL,
    title text NOT NULL,
    "fileName" text NOT NULL,
    "mimeType" text,
    "storagePath" text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    tags text[],
    "expiresAt" timestamp(3) without time zone,
    "uploadedById" text,
    "isPrivate" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "workOrderId" text
);


--
-- Name: Equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Equipment" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "serialNumber" text,
    category text,
    status public."EquipmentStatus" DEFAULT 'AVAILABLE'::public."EquipmentStatus" NOT NULL,
    "maintenanceDueAt" timestamp(3) without time zone,
    "qrCode" text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "clientId" text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "issueDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "baseAmount" numeric(14,2) NOT NULL,
    "vatRate" numeric(5,2) NOT NULL,
    "vatAmount" numeric(14,2) NOT NULL,
    "totalAmount" numeric(14,2) NOT NULL,
    "paidAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MaterialRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaterialRequest" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "materialId" text NOT NULL,
    "requestedById" text NOT NULL,
    "approvedById" text,
    quantity numeric(12,2) NOT NULL,
    status public."MaterialRequestStatus" DEFAULT 'PENDING'::public."MaterialRequestStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "actionUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: StockMovement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockMovement" (
    id text NOT NULL,
    "materialId" text NOT NULL,
    "warehouseId" text NOT NULL,
    "projectId" text,
    type public."StockMovementType" NOT NULL,
    quantity numeric(12,2) NOT NULL,
    "unitCost" numeric(10,2),
    "documentRef" text,
    note text,
    "movedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TimeEntry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TimeEntry" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text NOT NULL,
    "workOrderId" text,
    "startAt" timestamp(3) without time zone NOT NULL,
    "endAt" timestamp(3) without time zone,
    "breakMinutes" integer DEFAULT 0 NOT NULL,
    "overtimeMinutes" integer DEFAULT 0 NOT NULL,
    "durationMinutes" integer DEFAULT 0 NOT NULL,
    note text,
    status public."TimeEntryStatus" DEFAULT 'DRAFT'::public."TimeEntryStatus" NOT NULL,
    "gpsLatitude" numeric(10,7),
    "gpsLongitude" numeric(10,7),
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "liveState" public."TimeEntryLiveState" DEFAULT 'STOPPED'::public."TimeEntryLiveState" NOT NULL,
    "pauseAccumulatedMinutes" integer DEFAULT 0 NOT NULL,
    "pausedAt" timestamp(3) without time zone
);


--
-- Name: WorkOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkOrder" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "phaseId" text,
    title text NOT NULL,
    description text,
    "siteLocation" text,
    "responsibleId" text,
    "teamId" text,
    "startDate" timestamp(3) without time zone,
    "dueDate" timestamp(3) without time zone,
    "estimatedHours" numeric(8,2),
    "actualHours" numeric(8,2),
    status public."WorkOrderStatus" DEFAULT 'TODO'::public."WorkOrderStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "checklistProgress" integer DEFAULT 0 NOT NULL,
    "dependencyIds" text[],
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurrenceRule" text,
    "approvalRequired" boolean DEFAULT false NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "approvedById" text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: CostEntry; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."CostEntry" VALUES ('cmo90qshx00xs8p8ctiqc9h25', 'cmo90jru300388p8c1ire5mdf', 'LABOR', 'Cost operational inregistrat automat', 12222.00, '2026-03-19 20:30:31.749', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:31.75');
INSERT INTO public."CostEntry" VALUES ('cmo90qstq00xu8p8cjxypm3dl', 'cmo90jsuh003d8p8cnpiz3rtb', 'MATERIAL', 'Cost operational inregistrat automat', 12151.00, '2026-04-14 19:30:32.174', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:32.175');
INSERT INTO public."CostEntry" VALUES ('cmo90qt9m00xw8p8c0n2t88a4', 'cmo90jtqk003i8p8cibxkcwtl', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 11544.00, '2026-03-23 20:30:32.656', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:32.657');
INSERT INTO public."CostEntry" VALUES ('cmo90qtn600xy8p8c5admn9kl', 'cmo90jum2003n8p8crdn2hbox', 'EQUIPMENT', 'Cost operational inregistrat automat', 7330.00, '2026-03-03 20:30:33.234', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:33.235');
INSERT INTO public."CostEntry" VALUES ('cmo90qtyq00y08p8c5i921jb0', 'cmo90jvhh003s8p8cea5xvr00', 'LABOR', 'Cost operational inregistrat automat', 6453.00, '2026-04-07 19:30:33.649', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:33.65');
INSERT INTO public."CostEntry" VALUES ('cmo90qu9w00y28p8csyyw6wq7', 'cmo90jw9o003x8p8cfu1ajyh1', 'MATERIAL', 'Cost operational inregistrat automat', 2463.00, '2026-04-13 19:30:34.051', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:34.052');
INSERT INTO public."CostEntry" VALUES ('cmo90qula00y48p8c5r9bbasq', 'cmo90jyvq00428p8cx3o0km3g', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 13070.00, '2026-04-12 19:30:34.461', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:34.462');
INSERT INTO public."CostEntry" VALUES ('cmo90quxe00y68p8c45cdlri7', 'cmo90k1in00478p8cxmksb7pr', 'EQUIPMENT', 'Cost operational inregistrat automat', 13108.00, '2026-04-10 19:30:34.898', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:34.899');
INSERT INTO public."CostEntry" VALUES ('cmo90qv9u00y88p8cowok9s9i', 'cmo90k2n4004c8p8cnr3rna98', 'LABOR', 'Cost operational inregistrat automat', 13617.00, '2026-02-25 20:30:35.345', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:35.346');
INSERT INTO public."CostEntry" VALUES ('cmo90qvld00ya8p8c226rpx7y', 'cmo90k3s1004h8p8cwg75w5pi', 'MATERIAL', 'Cost operational inregistrat automat', 9296.00, '2026-03-12 20:30:35.761', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:35.761');
INSERT INTO public."CostEntry" VALUES ('cmo90qvyc00yc8p8cfho8s06i', 'cmo90k4ve004m8p8cxmgwdlsa', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 13608.00, '2026-03-26 20:30:36.228', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:36.229');
INSERT INTO public."CostEntry" VALUES ('cmo90qwbq00ye8p8c187vm91s', 'cmo90k66y004r8p8c51np3e4s', 'EQUIPMENT', 'Cost operational inregistrat automat', 10285.00, '2026-04-06 19:30:36.709', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:36.71');
INSERT INTO public."CostEntry" VALUES ('cmo90qwp600yg8p8cd8neir20', 'cmo90jru300388p8c1ire5mdf', 'LABOR', 'Cost operational inregistrat automat', 11050.00, '2026-03-14 20:30:37.194', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:37.195');
INSERT INTO public."CostEntry" VALUES ('cmo90qx8100yi8p8c835qpbo2', 'cmo90jsuh003d8p8cnpiz3rtb', 'MATERIAL', 'Cost operational inregistrat automat', 14563.00, '2026-03-24 20:30:37.873', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:37.873');
INSERT INTO public."CostEntry" VALUES ('cmo90qxpp00yk8p8cjtje41u2', 'cmo90jtqk003i8p8cibxkcwtl', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 6333.00, '2026-04-19 19:30:38.509', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:38.51');
INSERT INTO public."CostEntry" VALUES ('cmo90qy5f00ym8p8czt84gm55', 'cmo90jum2003n8p8crdn2hbox', 'EQUIPMENT', 'Cost operational inregistrat automat', 4277.00, '2026-03-07 20:30:39.075', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:39.076');
INSERT INTO public."CostEntry" VALUES ('cmo90qynr00yo8p8c74dav9w4', 'cmo90jvhh003s8p8cea5xvr00', 'LABOR', 'Cost operational inregistrat automat', 5548.00, '2026-03-05 20:30:39.735', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:39.736');
INSERT INTO public."CostEntry" VALUES ('cmo90qz3g00yq8p8cxod8h2sf', 'cmo90jw9o003x8p8cfu1ajyh1', 'MATERIAL', 'Cost operational inregistrat automat', 7604.00, '2026-03-25 20:30:40.299', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:40.3');
INSERT INTO public."CostEntry" VALUES ('cmo90qzib00ys8p8cjo3ni788', 'cmo90jyvq00428p8cx3o0km3g', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 12179.00, '2026-04-15 19:30:40.834', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:40.835');
INSERT INTO public."CostEntry" VALUES ('cmo90r09e00yu8p8c9fk8wd2g', 'cmo90k1in00478p8cxmksb7pr', 'EQUIPMENT', 'Cost operational inregistrat automat', 6193.00, '2026-03-31 19:30:41.81', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:41.81');
INSERT INTO public."CostEntry" VALUES ('cmo90r0z000yw8p8cyia6i15g', 'cmo90k2n4004c8p8cnr3rna98', 'LABOR', 'Cost operational inregistrat automat', 3801.00, '2026-03-03 20:30:42.731', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:42.732');
INSERT INTO public."CostEntry" VALUES ('cmo90r1hw00yy8p8cm72lmwk0', 'cmo90k3s1004h8p8cwg75w5pi', 'MATERIAL', 'Cost operational inregistrat automat', 5343.00, '2026-04-19 19:30:43.412', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:43.413');
INSERT INTO public."CostEntry" VALUES ('cmo90r2by00z08p8cfufzurph', 'cmo90k4ve004m8p8cxmgwdlsa', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 11709.00, '2026-02-21 20:30:44.494', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:44.494');
INSERT INTO public."CostEntry" VALUES ('cmo90r2zx00z28p8ckh89ev5z', 'cmo90k66y004r8p8c51np3e4s', 'EQUIPMENT', 'Cost operational inregistrat automat', 14750.00, '2026-03-15 20:30:45.356', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:45.357');
INSERT INTO public."CostEntry" VALUES ('cmo90r3gb00z48p8cb84f44ma', 'cmo90jru300388p8c1ire5mdf', 'LABOR', 'Cost operational inregistrat automat', 10617.00, '2026-04-19 19:30:45.946', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:45.947');
INSERT INTO public."CostEntry" VALUES ('cmo90r3ts00z68p8czxz5ijsd', 'cmo90jsuh003d8p8cnpiz3rtb', 'MATERIAL', 'Cost operational inregistrat automat', 9482.00, '2026-03-26 20:30:46.432', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:46.433');
INSERT INTO public."CostEntry" VALUES ('cmo90r46y00z88p8civ37jilw', 'cmo90jtqk003i8p8cibxkcwtl', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 6663.00, '2026-03-18 20:30:46.906', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:46.906');
INSERT INTO public."CostEntry" VALUES ('cmo90r4jk00za8p8c9xf2q2m8', 'cmo90jum2003n8p8crdn2hbox', 'EQUIPMENT', 'Cost operational inregistrat automat', 1801.00, '2026-04-03 19:30:47.359', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:47.36');
INSERT INTO public."CostEntry" VALUES ('cmo90r51t00zc8p8coagj4tku', 'cmo90jvhh003s8p8cea5xvr00', 'LABOR', 'Cost operational inregistrat automat', 11706.00, '2026-04-07 19:30:47.936', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:47.937');
INSERT INTO public."CostEntry" VALUES ('cmo90r5fi00ze8p8cn4hqtnr0', 'cmo90jw9o003x8p8cfu1ajyh1', 'MATERIAL', 'Cost operational inregistrat automat', 4834.00, '2026-03-15 20:30:48.51', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:48.51');
INSERT INTO public."CostEntry" VALUES ('cmo90r5s600zg8p8cmcczmusk', 'cmo90jyvq00428p8cx3o0km3g', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 13542.00, '2026-03-02 20:30:48.966', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:48.967');
INSERT INTO public."CostEntry" VALUES ('cmo90r64p00zi8p8ctfze12tl', 'cmo90k1in00478p8cxmksb7pr', 'EQUIPMENT', 'Cost operational inregistrat automat', 13951.00, '2026-03-24 20:30:49.417', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:49.418');
INSERT INTO public."CostEntry" VALUES ('cmo90r6i900zk8p8cgcodkttj', 'cmo90k2n4004c8p8cnr3rna98', 'LABOR', 'Cost operational inregistrat automat', 5502.00, '2026-04-04 19:30:49.905', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:49.906');
INSERT INTO public."CostEntry" VALUES ('cmo90r6tm00zm8p8cyyhhtpn3', 'cmo90k3s1004h8p8cwg75w5pi', 'MATERIAL', 'Cost operational inregistrat automat', 8662.00, '2026-04-09 19:30:50.314', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:50.315');
INSERT INTO public."CostEntry" VALUES ('cmo90r77u00zo8p8cnu5py58v', 'cmo90k4ve004m8p8cxmgwdlsa', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 6753.00, '2026-02-28 20:30:50.826', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:50.827');
INSERT INTO public."CostEntry" VALUES ('cmo90r7ld00zq8p8c3y69ifbq', 'cmo90k66y004r8p8c51np3e4s', 'EQUIPMENT', 'Cost operational inregistrat automat', 14219.00, '2026-03-05 20:30:51.313', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:51.313');
INSERT INTO public."CostEntry" VALUES ('cmo90r7zh00zs8p8c75vrq79j', 'cmo90jru300388p8c1ire5mdf', 'LABOR', 'Cost operational inregistrat automat', 11113.00, '2026-03-28 20:30:51.821', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:51.822');
INSERT INTO public."CostEntry" VALUES ('cmo90r8bw00zu8p8casgauz0q', 'cmo90jsuh003d8p8cnpiz3rtb', 'MATERIAL', 'Cost operational inregistrat automat', 12075.00, '2026-03-09 20:30:52.267', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:52.268');
INSERT INTO public."CostEntry" VALUES ('cmo90r8ny00zw8p8cb3627z34', 'cmo90jtqk003i8p8cibxkcwtl', 'SUBCONTRACTOR', 'Cost operational inregistrat automat', 9842.00, '2026-02-21 20:30:52.701', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:52.702');
INSERT INTO public."CostEntry" VALUES ('cmo90r8zt00zy8p8ce6m6etdv', 'cmo90jum2003n8p8crdn2hbox', 'EQUIPMENT', 'Cost operational inregistrat automat', 9567.00, '2026-03-16 20:30:53.129', 'cmo90jfyu002e8p8c7d5dflsm', '2026-04-21 19:30:53.13');


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Document" VALUES ('cmo90r9bi01008p8cc634sfju', 'cmo90jru300388p8c1ire5mdf', NULL, 'CONTRACT', 'Document proiect #1', 'doc-1.pdf', 'application/pdf', '/documents/demo/doc-1.pdf', 1, '{santier,2026}', '2026-05-11 19:30:53.549', 'cmo90j7es00278p8c6ydj8ylc', true, '2026-04-21 19:30:53.55', '2026-04-21 19:30:53.55', NULL);
INSERT INTO public."Document" VALUES ('cmo90r9qa01028p8ccilc4444', 'cmo90jsuh003d8p8cnpiz3rtb', NULL, 'INVOICE', 'Document proiect #2', 'doc-2.pdf', 'application/pdf', '/documents/demo/doc-2.pdf', 1, '{santier,2026}', NULL, 'cmo90j8gd00288p8c5r5vhur3', true, '2026-04-21 19:30:54.082', '2026-04-21 19:30:54.082', NULL);
INSERT INTO public."Document" VALUES ('cmo90rarg01048p8cn2uwkghd', 'cmo90jtqk003i8p8cibxkcwtl', NULL, 'SITE_REPORT', 'Document proiect #3', 'doc-3.pdf', 'application/pdf', '/documents/demo/doc-3.pdf', 1, '{santier,2026}', NULL, 'cmo90ja3800298p8cqphzc1hi', true, '2026-04-21 19:30:55.42', '2026-04-21 19:30:55.42', NULL);
INSERT INTO public."Document" VALUES ('cmo90rb8f01068p8cedcaduag', 'cmo90jum2003n8p8crdn2hbox', NULL, 'PHOTO', 'Document proiect #4', 'doc-4.pdf', 'application/pdf', '/documents/demo/doc-4.pdf', 1, '{santier,2026}', NULL, 'cmo90jbmm002a8p8cukr7msxp', true, '2026-04-21 19:30:56.031', '2026-04-21 19:30:56.031', NULL);
INSERT INTO public."Document" VALUES ('cmo90rblv01088p8cwti7z0bh', 'cmo90jvhh003s8p8cea5xvr00', NULL, 'CONTRACT', 'Document proiect #5', 'doc-5.pdf', 'application/pdf', '/documents/demo/doc-5.pdf', 1, '{santier,2026}', NULL, 'cmo90jdce002b8p8cxqbo6s6q', true, '2026-04-21 19:30:56.516', '2026-04-21 19:30:56.516', NULL);
INSERT INTO public."Document" VALUES ('cmo90rbz3010a8p8c8hldkvwc', 'cmo90jw9o003x8p8cfu1ajyh1', NULL, 'INVOICE', 'Document proiect #6', 'doc-6.pdf', 'application/pdf', '/documents/demo/doc-6.pdf', 1, '{santier,2026}', '2026-05-11 19:30:56.991', 'cmo90je36002c8p8c86e5snpa', true, '2026-04-21 19:30:56.992', '2026-04-21 19:30:56.992', NULL);
INSERT INTO public."Document" VALUES ('cmo90rchh010c8p8cgpu2yvcy', 'cmo90jyvq00428p8cx3o0km3g', NULL, 'SITE_REPORT', 'Document proiect #7', 'doc-7.pdf', 'application/pdf', '/documents/demo/doc-7.pdf', 1, '{santier,2026}', NULL, 'cmo90jetj002d8p8c6fhl8jgg', true, '2026-04-21 19:30:57.653', '2026-04-21 19:30:57.653', NULL);
INSERT INTO public."Document" VALUES ('cmo90rcwe010e8p8cj7aov081', 'cmo90k1in00478p8cxmksb7pr', NULL, 'PHOTO', 'Document proiect #8', 'doc-8.pdf', 'application/pdf', '/documents/demo/doc-8.pdf', 1, '{santier,2026}', NULL, 'cmo90jfyu002e8p8c7d5dflsm', true, '2026-04-21 19:30:58.191', '2026-04-21 19:30:58.191', NULL);
INSERT INTO public."Document" VALUES ('cmo90rdg5010g8p8ce5yo0iw8', 'cmo90k2n4004c8p8cnr3rna98', NULL, 'CONTRACT', 'Document proiect #9', 'doc-9.pdf', 'application/pdf', '/documents/demo/doc-9.pdf', 1, '{santier,2026}', NULL, 'cmo90jgx0002f8p8ctbpzi1kv', true, '2026-04-21 19:30:58.902', '2026-04-21 19:30:58.902', NULL);
INSERT INTO public."Document" VALUES ('cmo90re0o010i8p8c9cjxc6ae', 'cmo90k3s1004h8p8cwg75w5pi', NULL, 'INVOICE', 'Document proiect #10', 'doc-10.pdf', 'application/pdf', '/documents/demo/doc-10.pdf', 1, '{santier,2026}', NULL, 'cmo90ji13002g8p8cooiuiwhs', true, '2026-04-21 19:30:59.64', '2026-04-21 19:30:59.64', NULL);
INSERT INTO public."Document" VALUES ('cmo90reky010k8p8cfzdan0no', 'cmo90k4ve004m8p8cxmgwdlsa', NULL, 'SITE_REPORT', 'Document proiect #11', 'doc-11.pdf', 'application/pdf', '/documents/demo/doc-11.pdf', 1, '{santier,2026}', '2026-05-11 19:31:00.37', 'cmo90j7es00278p8c6ydj8ylc', true, '2026-04-21 19:31:00.371', '2026-04-21 19:31:00.371', NULL);
INSERT INTO public."Document" VALUES ('cmo90rf18010m8p8ckejmyn4h', 'cmo90k66y004r8p8c51np3e4s', NULL, 'PHOTO', 'Document proiect #12', 'doc-12.pdf', 'application/pdf', '/documents/demo/doc-12.pdf', 1, '{santier,2026}', NULL, 'cmo90j8gd00288p8c5r5vhur3', true, '2026-04-21 19:31:00.956', '2026-04-21 19:31:00.956', NULL);
INSERT INTO public."Document" VALUES ('cmo90rft9010o8p8cl5m3y0gk', 'cmo90jru300388p8c1ire5mdf', NULL, 'CONTRACT', 'Document proiect #13', 'doc-13.pdf', 'application/pdf', '/documents/demo/doc-13.pdf', 1, '{santier,2026}', NULL, 'cmo90ja3800298p8cqphzc1hi', true, '2026-04-21 19:31:01.966', '2026-04-21 19:31:01.966', NULL);
INSERT INTO public."Document" VALUES ('cmo90rgaw010q8p8c7wiq5x07', 'cmo90jsuh003d8p8cnpiz3rtb', NULL, 'INVOICE', 'Document proiect #14', 'doc-14.pdf', 'application/pdf', '/documents/demo/doc-14.pdf', 1, '{santier,2026}', NULL, 'cmo90jbmm002a8p8cukr7msxp', true, '2026-04-21 19:31:02.601', '2026-04-21 19:31:02.601', NULL);
INSERT INTO public."Document" VALUES ('cmo90rh2g010s8p8csozgx17n', 'cmo90jtqk003i8p8cibxkcwtl', NULL, 'SITE_REPORT', 'Document proiect #15', 'doc-15.pdf', 'application/pdf', '/documents/demo/doc-15.pdf', 1, '{santier,2026}', NULL, 'cmo90jdce002b8p8cxqbo6s6q', true, '2026-04-21 19:31:03.468', '2026-04-21 19:31:03.468', NULL);
INSERT INTO public."Document" VALUES ('cmo90rhv7010u8p8cfcg1cy1m', 'cmo90jum2003n8p8crdn2hbox', NULL, 'PHOTO', 'Document proiect #16', 'doc-16.pdf', 'application/pdf', '/documents/demo/doc-16.pdf', 1, '{santier,2026}', '2026-05-11 19:31:04.626', 'cmo90je36002c8p8c86e5snpa', true, '2026-04-21 19:31:04.627', '2026-04-21 19:31:04.627', NULL);
INSERT INTO public."Document" VALUES ('cmo90riao010w8p8civ1y9o7t', 'cmo90jvhh003s8p8cea5xvr00', NULL, 'CONTRACT', 'Document proiect #17', 'doc-17.pdf', 'application/pdf', '/documents/demo/doc-17.pdf', 1, '{santier,2026}', NULL, 'cmo90jetj002d8p8c6fhl8jgg', true, '2026-04-21 19:31:05.185', '2026-04-21 19:31:05.185', NULL);
INSERT INTO public."Document" VALUES ('cmo90ritl010y8p8chhjjgqqy', 'cmo90jw9o003x8p8cfu1ajyh1', NULL, 'INVOICE', 'Document proiect #18', 'doc-18.pdf', 'application/pdf', '/documents/demo/doc-18.pdf', 1, '{santier,2026}', NULL, 'cmo90jfyu002e8p8c7d5dflsm', true, '2026-04-21 19:31:05.865', '2026-04-21 19:31:05.865', NULL);
INSERT INTO public."Document" VALUES ('cmo90rj6701108p8clr9m6xgm', 'cmo90jyvq00428p8cx3o0km3g', NULL, 'SITE_REPORT', 'Document proiect #19', 'doc-19.pdf', 'application/pdf', '/documents/demo/doc-19.pdf', 1, '{santier,2026}', NULL, 'cmo90jgx0002f8p8ctbpzi1kv', true, '2026-04-21 19:31:06.319', '2026-04-21 19:31:06.319', NULL);
INSERT INTO public."Document" VALUES ('cmo90rjjd01128p8cxcff0rmm', 'cmo90k1in00478p8cxmksb7pr', NULL, 'PHOTO', 'Document proiect #20', 'doc-20.pdf', 'application/pdf', '/documents/demo/doc-20.pdf', 1, '{santier,2026}', NULL, 'cmo90ji13002g8p8cooiuiwhs', true, '2026-04-21 19:31:06.793', '2026-04-21 19:31:06.793', NULL);
INSERT INTO public."Document" VALUES ('cmo90rjwo01148p8crj5s0ay1', 'cmo90k2n4004c8p8cnr3rna98', NULL, 'CONTRACT', 'Document proiect #21', 'doc-21.pdf', 'application/pdf', '/documents/demo/doc-21.pdf', 1, '{santier,2026}', '2026-05-11 19:31:07.272', 'cmo90j7es00278p8c6ydj8ylc', true, '2026-04-21 19:31:07.272', '2026-04-21 19:31:07.272', NULL);
INSERT INTO public."Document" VALUES ('cmo90rk9b01168p8c5fso4451', 'cmo90k3s1004h8p8cwg75w5pi', NULL, 'INVOICE', 'Document proiect #22', 'doc-22.pdf', 'application/pdf', '/documents/demo/doc-22.pdf', 1, '{santier,2026}', NULL, 'cmo90j8gd00288p8c5r5vhur3', true, '2026-04-21 19:31:07.727', '2026-04-21 19:31:07.727', NULL);
INSERT INTO public."Document" VALUES ('cmo90rkms01188p8cm9wgvfja', 'cmo90k4ve004m8p8cxmgwdlsa', NULL, 'SITE_REPORT', 'Document proiect #23', 'doc-23.pdf', 'application/pdf', '/documents/demo/doc-23.pdf', 1, '{santier,2026}', NULL, 'cmo90ja3800298p8cqphzc1hi', true, '2026-04-21 19:31:08.212', '2026-04-21 19:31:08.212', NULL);
INSERT INTO public."Document" VALUES ('cmo90rkzh011a8p8cad8smq6t', 'cmo90k66y004r8p8c51np3e4s', NULL, 'PHOTO', 'Document proiect #24', 'doc-24.pdf', 'application/pdf', '/documents/demo/doc-24.pdf', 1, '{santier,2026}', NULL, 'cmo90jbmm002a8p8cukr7msxp', true, '2026-04-21 19:31:08.67', '2026-04-21 19:31:08.67', NULL);
INSERT INTO public."Document" VALUES ('cmo90rlcz011c8p8c6bz9j106', 'cmo90jru300388p8c1ire5mdf', NULL, 'CONTRACT', 'Document proiect #25', 'doc-25.pdf', 'application/pdf', '/documents/demo/doc-25.pdf', 1, '{santier,2026}', NULL, 'cmo90jdce002b8p8cxqbo6s6q', true, '2026-04-21 19:31:09.155', '2026-04-21 19:31:09.155', NULL);
INSERT INTO public."Document" VALUES ('cmo90rlqb011e8p8c6k2utq7f', 'cmo90jsuh003d8p8cnpiz3rtb', NULL, 'INVOICE', 'Document proiect #26', 'doc-26.pdf', 'application/pdf', '/documents/demo/doc-26.pdf', 1, '{santier,2026}', '2026-05-11 19:31:09.634', 'cmo90je36002c8p8c86e5snpa', true, '2026-04-21 19:31:09.635', '2026-04-21 19:31:09.635', NULL);
INSERT INTO public."Document" VALUES ('cmo90rm2h011g8p8cbbcg8949', 'cmo90jtqk003i8p8cibxkcwtl', NULL, 'SITE_REPORT', 'Document proiect #27', 'doc-27.pdf', 'application/pdf', '/documents/demo/doc-27.pdf', 1, '{santier,2026}', NULL, 'cmo90jetj002d8p8c6fhl8jgg', true, '2026-04-21 19:31:10.074', '2026-04-21 19:31:10.074', NULL);
INSERT INTO public."Document" VALUES ('cmo90rmf4011i8p8cibevmol0', 'cmo90jum2003n8p8crdn2hbox', NULL, 'PHOTO', 'Document proiect #28', 'doc-28.pdf', 'application/pdf', '/documents/demo/doc-28.pdf', 1, '{santier,2026}', NULL, 'cmo90jfyu002e8p8c7d5dflsm', true, '2026-04-21 19:31:10.528', '2026-04-21 19:31:10.528', NULL);
INSERT INTO public."Document" VALUES ('cmo90rmr4011k8p8cxshosgpj', 'cmo90jvhh003s8p8cea5xvr00', NULL, 'CONTRACT', 'Document proiect #29', 'doc-29.pdf', 'application/pdf', '/documents/demo/doc-29.pdf', 1, '{santier,2026}', NULL, 'cmo90jgx0002f8p8ctbpzi1kv', true, '2026-04-21 19:31:10.96', '2026-04-21 19:31:10.96', NULL);
INSERT INTO public."Document" VALUES ('cmo90rn3t011m8p8ccfzhzhss', 'cmo90jw9o003x8p8cfu1ajyh1', NULL, 'INVOICE', 'Document proiect #30', 'doc-30.pdf', 'application/pdf', '/documents/demo/doc-30.pdf', 1, '{santier,2026}', NULL, 'cmo90ji13002g8p8cooiuiwhs', true, '2026-04-21 19:31:11.417', '2026-04-21 19:31:11.417', NULL);
INSERT INTO public."Document" VALUES ('cmo90rnge011o8p8ch7ne8hlx', 'cmo90jyvq00428p8cx3o0km3g', NULL, 'SITE_REPORT', 'Document proiect #31', 'doc-31.pdf', 'application/pdf', '/documents/demo/doc-31.pdf', 1, '{santier,2026}', '2026-05-11 19:31:11.87', 'cmo90j7es00278p8c6ydj8ylc', true, '2026-04-21 19:31:11.871', '2026-04-21 19:31:11.871', NULL);
INSERT INTO public."Document" VALUES ('cmo90rntm011q8p8c4vuvaqoh', 'cmo90k1in00478p8cxmksb7pr', NULL, 'PHOTO', 'Document proiect #32', 'doc-32.pdf', 'application/pdf', '/documents/demo/doc-32.pdf', 1, '{santier,2026}', NULL, 'cmo90j8gd00288p8c5r5vhur3', true, '2026-04-21 19:31:12.346', '2026-04-21 19:31:12.346', NULL);
INSERT INTO public."Document" VALUES ('cmo90ro76011s8p8clvwjyi8w', 'cmo90k2n4004c8p8cnr3rna98', NULL, 'CONTRACT', 'Document proiect #33', 'doc-33.pdf', 'application/pdf', '/documents/demo/doc-33.pdf', 1, '{santier,2026}', NULL, 'cmo90ja3800298p8cqphzc1hi', true, '2026-04-21 19:31:12.835', '2026-04-21 19:31:12.835', NULL);
INSERT INTO public."Document" VALUES ('cmo90roj7011u8p8cy0iz0mii', 'cmo90k3s1004h8p8cwg75w5pi', NULL, 'INVOICE', 'Document proiect #34', 'doc-34.pdf', 'application/pdf', '/documents/demo/doc-34.pdf', 1, '{santier,2026}', NULL, 'cmo90jbmm002a8p8cukr7msxp', true, '2026-04-21 19:31:13.267', '2026-04-21 19:31:13.267', NULL);
INSERT INTO public."Document" VALUES ('cmo90rowz011w8p8cmbrl7kho', 'cmo90k4ve004m8p8cxmgwdlsa', NULL, 'SITE_REPORT', 'Document proiect #35', 'doc-35.pdf', 'application/pdf', '/documents/demo/doc-35.pdf', 1, '{santier,2026}', NULL, 'cmo90jdce002b8p8cxqbo6s6q', true, '2026-04-21 19:31:13.763', '2026-04-21 19:31:13.763', NULL);
INSERT INTO public."Document" VALUES ('cmo90rpad011y8p8c0s2a9k0i', 'cmo90k66y004r8p8c51np3e4s', NULL, 'PHOTO', 'Document proiect #36', 'doc-36.pdf', 'application/pdf', '/documents/demo/doc-36.pdf', 1, '{santier,2026}', '2026-05-11 19:31:14.244', 'cmo90je36002c8p8c86e5snpa', true, '2026-04-21 19:31:14.245', '2026-04-21 19:31:14.245', NULL);
INSERT INTO public."Document" VALUES ('cmo90rpm401208p8cp6er5s2u', 'cmo90jru300388p8c1ire5mdf', NULL, 'CONTRACT', 'Document proiect #37', 'doc-37.pdf', 'application/pdf', '/documents/demo/doc-37.pdf', 1, '{santier,2026}', NULL, 'cmo90jetj002d8p8c6fhl8jgg', true, '2026-04-21 19:31:14.669', '2026-04-21 19:31:14.669', NULL);
INSERT INTO public."Document" VALUES ('cmo90rq0c01228p8c4v33ushj', 'cmo90jsuh003d8p8cnpiz3rtb', NULL, 'INVOICE', 'Document proiect #38', 'doc-38.pdf', 'application/pdf', '/documents/demo/doc-38.pdf', 1, '{santier,2026}', NULL, 'cmo90jfyu002e8p8c7d5dflsm', true, '2026-04-21 19:31:15.18', '2026-04-21 19:31:15.18', NULL);
INSERT INTO public."Document" VALUES ('cmo90rqdt01248p8c6mt2fnmh', 'cmo90jtqk003i8p8cibxkcwtl', NULL, 'SITE_REPORT', 'Document proiect #39', 'doc-39.pdf', 'application/pdf', '/documents/demo/doc-39.pdf', 1, '{santier,2026}', NULL, 'cmo90jgx0002f8p8ctbpzi1kv', true, '2026-04-21 19:31:15.665', '2026-04-21 19:31:15.665', NULL);
INSERT INTO public."Document" VALUES ('cmo90rqqu01268p8c99pn92am', 'cmo90jum2003n8p8crdn2hbox', NULL, 'PHOTO', 'Document proiect #40', 'doc-40.pdf', 'application/pdf', '/documents/demo/doc-40.pdf', 1, '{santier,2026}', NULL, 'cmo90ji13002g8p8cooiuiwhs', true, '2026-04-21 19:31:16.135', '2026-04-21 19:31:16.135', NULL);


--
-- Data for Name: Equipment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Equipment" VALUES ('cmo90qkte00x98p8c0bbf96pu', 'EQ-001', 'Generator', 'SN-9000', 'Utilaj', 'AVAILABLE', '2026-06-27 19:30:21.794', 'https://qr.eltgrup.ro/EQ-001', NULL, '2026-04-21 19:30:21.795', '2026-04-21 19:30:21.795');
INSERT INTO public."Equipment" VALUES ('cmo90ql9h00xa8p8cptet0pv2', 'EQ-002', 'Platforma ridicare', 'SN-9001', 'Utilaj', 'IN_USE', '2026-06-04 19:30:22.372', 'https://qr.eltgrup.ro/EQ-002', NULL, '2026-04-21 19:30:22.373', '2026-04-21 19:30:22.373');
INSERT INTO public."Equipment" VALUES ('cmo90qlre00xb8p8cqdu29afz', 'EQ-003', 'Aparat sudura', 'SN-9002', 'Utilaj', 'SERVICE', '2026-08-19 19:30:23.018', 'https://qr.eltgrup.ro/EQ-003', NULL, '2026-04-21 19:30:23.019', '2026-04-21 19:30:23.019');
INSERT INTO public."Equipment" VALUES ('cmo90qmki00xc8p8cudu8vh70', 'EQ-004', 'Compresor', 'SN-9003', 'Utilaj', 'AVAILABLE', '2026-08-08 19:30:24.066', 'https://qr.eltgrup.ro/EQ-004', NULL, '2026-04-21 19:30:24.067', '2026-04-21 19:30:24.067');
INSERT INTO public."Equipment" VALUES ('cmo90qn6t00xd8p8cj9n5bcjn', 'EQ-005', 'Tester izolatie', 'SN-9004', 'Utilaj', 'IN_USE', '2026-05-27 19:30:24.869', 'https://qr.eltgrup.ro/EQ-005', NULL, '2026-04-21 19:30:24.87', '2026-04-21 19:30:24.87');
INSERT INTO public."Equipment" VALUES ('cmo90qnm500xe8p8c35qw73ue', 'EQ-006', 'Generator', 'SN-9005', 'Utilaj', 'SERVICE', '2026-05-27 19:30:25.42', 'https://qr.eltgrup.ro/EQ-006', NULL, '2026-04-21 19:30:25.421', '2026-04-21 19:30:25.421');
INSERT INTO public."Equipment" VALUES ('cmo90qo1k00xf8p8ctsxown0x', 'EQ-007', 'Platforma ridicare', 'SN-9006', 'Utilaj', 'AVAILABLE', '2026-05-27 19:30:25.976', 'https://qr.eltgrup.ro/EQ-007', NULL, '2026-04-21 19:30:25.977', '2026-04-21 19:30:25.977');
INSERT INTO public."Equipment" VALUES ('cmo90qodr00xg8p8ca7ckteae', 'EQ-008', 'Aparat sudura', 'SN-9007', 'Utilaj', 'IN_USE', '2026-07-16 19:30:26.415', 'https://qr.eltgrup.ro/EQ-008', NULL, '2026-04-21 19:30:26.416', '2026-04-21 19:30:26.416');
INSERT INTO public."Equipment" VALUES ('cmo90qor300xh8p8czieoan11', 'EQ-009', 'Compresor', 'SN-9008', 'Utilaj', 'SERVICE', '2026-06-21 19:30:26.895', 'https://qr.eltgrup.ro/EQ-009', NULL, '2026-04-21 19:30:26.895', '2026-04-21 19:30:26.895');
INSERT INTO public."Equipment" VALUES ('cmo90qp6i00xi8p8cve3b6otv', 'EQ-010', 'Tester izolatie', 'SN-9009', 'Utilaj', 'AVAILABLE', '2026-08-17 19:30:27.45', 'https://qr.eltgrup.ro/EQ-010', NULL, '2026-04-21 19:30:27.451', '2026-04-21 19:30:27.451');
INSERT INTO public."Equipment" VALUES ('cmo90qpkl00xj8p8c21rvx9ws', 'EQ-011', 'Generator', 'SN-9010', 'Utilaj', 'IN_USE', '2026-07-26 19:30:27.956', 'https://qr.eltgrup.ro/EQ-011', NULL, '2026-04-21 19:30:27.957', '2026-04-21 19:30:27.957');
INSERT INTO public."Equipment" VALUES ('cmo90qpw000xk8p8cw786ge3s', 'EQ-012', 'Platforma ridicare', 'SN-9011', 'Utilaj', 'SERVICE', '2026-08-17 19:30:28.367', 'https://qr.eltgrup.ro/EQ-012', NULL, '2026-04-21 19:30:28.368', '2026-04-21 19:30:28.368');
INSERT INTO public."Equipment" VALUES ('cmo90qqch00xl8p8cuax7pqql', 'EQ-013', 'Aparat sudura', 'SN-9012', 'Utilaj', 'AVAILABLE', '2026-05-09 19:30:28.96', 'https://qr.eltgrup.ro/EQ-013', NULL, '2026-04-21 19:30:28.961', '2026-04-21 19:30:28.961');
INSERT INTO public."Equipment" VALUES ('cmo90qqpx00xm8p8c7ywgmif7', 'EQ-014', 'Compresor', 'SN-9013', 'Utilaj', 'IN_USE', '2026-05-11 19:30:29.445', 'https://qr.eltgrup.ro/EQ-014', NULL, '2026-04-21 19:30:29.446', '2026-04-21 19:30:29.446');
INSERT INTO public."Equipment" VALUES ('cmo90qr3g00xn8p8cwr1ks4zg', 'EQ-015', 'Tester izolatie', 'SN-9014', 'Utilaj', 'SERVICE', '2026-06-28 19:30:29.932', 'https://qr.eltgrup.ro/EQ-015', NULL, '2026-04-21 19:30:29.932', '2026-04-21 19:30:29.932');
INSERT INTO public."Equipment" VALUES ('cmo90qrfi00xo8p8caw4w3hdm', 'EQ-016', 'Generator', 'SN-9015', 'Utilaj', 'AVAILABLE', '2026-07-27 19:30:30.365', 'https://qr.eltgrup.ro/EQ-016', NULL, '2026-04-21 19:30:30.366', '2026-04-21 19:30:30.366');
INSERT INTO public."Equipment" VALUES ('cmo90qrsy00xp8p8cpxel1ksz', 'EQ-017', 'Platforma ridicare', 'SN-9016', 'Utilaj', 'IN_USE', '2026-07-21 19:30:30.85', 'https://qr.eltgrup.ro/EQ-017', NULL, '2026-04-21 19:30:30.85', '2026-04-21 19:30:30.85');
INSERT INTO public."Equipment" VALUES ('cmo90qs6p00xq8p8cldki0n86', 'EQ-018', 'Aparat sudura', 'SN-9017', 'Utilaj', 'SERVICE', '2026-05-19 19:30:31.345', 'https://qr.eltgrup.ro/EQ-018', NULL, '2026-04-21 19:30:31.346', '2026-04-21 19:30:31.346');


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Invoice" VALUES ('cmo90qe9d00wl8p8cclljix5x', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90jn8k002z8p8ctg2eqajt', 'ELT-INV-20260015', '2026-04-18 19:30:13.296', '2026-05-18 19:30:13.296', 40800.00, 19.00, 7752.00, 48552.00, 0.00, 'PARTIAL_PAID', NULL, NULL, NULL, '2026-04-21 19:30:13.297', '2026-04-21 19:30:13.297');
INSERT INTO public."Invoice" VALUES ('cmo92s99y000v8pjp1iyh7y48', 'cmo92s6vi000l8pjpz0g3gacg', 'cmo92s5qu000h8pjpj4qj1zdo', 'ONB-INV-2026-001', '2026-04-14 20:27:39.382', '2026-05-12 20:27:39.382', 18000.00, 19.00, 3420.00, 21420.00, 0.00, 'SENT', NULL, NULL, NULL, '2026-04-21 20:27:39.383', '2026-04-21 20:27:39.383');
INSERT INTO public."Invoice" VALUES ('cmo90q91200vt8p8cfdgvb6rf', 'cmo90jru300388p8c1ire5mdf', 'cmo90jlky002v8p8cbhpcquhp', 'ELT-INV-20260001', '2026-04-08 19:30:06.517', '2026-05-15 19:30:06.517', 10000.00, 19.00, 1900.00, 11900.00, 11900.00, 'SENT', NULL, NULL, NULL, '2026-04-21 19:30:06.518', '2026-04-21 19:30:06.518');
INSERT INTO public."Invoice" VALUES ('cmo90q9ga00vv8p8c43tpewzn', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90jm85002x8p8co4ht7dw4', 'ELT-INV-20260002', '2026-03-18 20:30:07.066', '2026-05-11 19:30:07.066', 12200.00, 19.00, 2318.00, 14518.00, 6100.00, 'OVERDUE', NULL, NULL, NULL, '2026-04-21 19:30:07.067', '2026-04-21 19:30:07.067');
INSERT INTO public."Invoice" VALUES ('cmo90q9ul00vx8p8cvasvmsta', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90jn8k002z8p8ctg2eqajt', 'ELT-INV-20260003', '2026-03-27 20:30:07.58', '2026-05-25 19:30:07.58', 14400.00, 19.00, 2736.00, 17136.00, 0.00, 'PARTIAL_PAID', NULL, NULL, NULL, '2026-04-21 19:30:07.581', '2026-04-21 19:30:07.581');
INSERT INTO public."Invoice" VALUES ('cmo90qa5v00vz8p8cqclgjiin', 'cmo90jum2003n8p8crdn2hbox', 'cmo90jo2o00318p8c8bf0x676', 'ELT-INV-20260004', '2026-04-03 19:30:07.987', '2026-05-24 19:30:07.987', 16600.00, 19.00, 3154.00, 19754.00, 0.00, 'PAID', NULL, NULL, NULL, '2026-04-21 19:30:07.988', '2026-04-21 19:30:07.988');
INSERT INTO public."Invoice" VALUES ('cmo90qakl00w18p8c4nltfr15', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90jotq00338p8c1pf7crgr', 'ELT-INV-20260005', '2026-04-05 19:30:08.517', '2026-04-11 19:30:08.517', 18800.00, 19.00, 3572.00, 22372.00, 22372.00, 'SENT', NULL, NULL, NULL, '2026-04-21 19:30:08.517', '2026-04-21 19:30:08.517');
INSERT INTO public."Invoice" VALUES ('cmo90qaya00w38p8cti5v0nwg', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90jqoc00358p8cc2z6r0in', 'ELT-INV-20260006', '2026-03-12 20:30:09.009', '2026-05-07 19:30:09.009', 21000.00, 19.00, 3990.00, 24990.00, 10500.00, 'OVERDUE', NULL, NULL, NULL, '2026-04-21 19:30:09.01', '2026-04-21 19:30:09.01');
INSERT INTO public."Invoice" VALUES ('cmo90qbdj00w58p8cnpjkmh95', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90jlky002v8p8cbhpcquhp', 'ELT-INV-20260007', '2026-04-10 19:30:09.558', '2026-04-19 19:30:09.558', 23200.00, 19.00, 4408.00, 27608.00, 0.00, 'PARTIAL_PAID', NULL, NULL, NULL, '2026-04-21 19:30:09.559', '2026-04-21 19:30:09.559');
INSERT INTO public."Invoice" VALUES ('cmo90qbq300w78p8c318ug1if', 'cmo90k1in00478p8cxmksb7pr', 'cmo90jm85002x8p8co4ht7dw4', 'ELT-INV-20260008', '2026-03-24 20:30:10.01', '2026-05-23 19:30:10.01', 25400.00, 19.00, 4826.00, 30226.00, 0.00, 'PAID', NULL, NULL, NULL, '2026-04-21 19:30:10.011', '2026-04-21 19:30:10.011');
INSERT INTO public."Invoice" VALUES ('cmo90qc3n00w98p8cv8t6mn8j', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90jn8k002z8p8ctg2eqajt', 'ELT-INV-20260009', '2026-03-24 20:30:10.498', '2026-04-18 19:30:10.498', 27600.00, 19.00, 5244.00, 32844.00, 32844.00, 'SENT', NULL, NULL, NULL, '2026-04-21 19:30:10.499', '2026-04-21 19:30:10.499');
INSERT INTO public."Invoice" VALUES ('cmo90qch000wb8p8cht646y78', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90jo2o00318p8c8bf0x676', 'ELT-INV-20260010', '2026-03-17 20:30:10.979', '2026-04-20 19:30:10.979', 29800.00, 19.00, 5662.00, 35462.00, 14900.00, 'OVERDUE', NULL, NULL, NULL, '2026-04-21 19:30:10.98', '2026-04-21 19:30:10.98');
INSERT INTO public."Invoice" VALUES ('cmo90qcu000wd8p8cqfku8nxg', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90jotq00338p8c1pf7crgr', 'ELT-INV-20260011', '2026-04-01 19:30:11.447', '2026-04-20 19:30:11.447', 32000.00, 19.00, 6080.00, 38080.00, 0.00, 'PARTIAL_PAID', NULL, NULL, NULL, '2026-04-21 19:30:11.448', '2026-04-21 19:30:11.448');
INSERT INTO public."Invoice" VALUES ('cmo90qd6b00wf8p8cehic6dwx', 'cmo90k66y004r8p8c51np3e4s', 'cmo90jqoc00358p8cc2z6r0in', 'ELT-INV-20260012', '2026-03-18 20:30:11.89', '2026-04-29 19:30:11.89', 34200.00, 19.00, 6498.00, 40698.00, 0.00, 'PAID', NULL, NULL, NULL, '2026-04-21 19:30:11.891', '2026-04-21 19:30:11.891');
INSERT INTO public."Invoice" VALUES ('cmo90qdkf00wh8p8ces1f5e2s', 'cmo90jru300388p8c1ire5mdf', 'cmo90jlky002v8p8cbhpcquhp', 'ELT-INV-20260013', '2026-04-07 19:30:12.398', '2026-05-07 19:30:12.398', 36400.00, 19.00, 6916.00, 43316.00, 43316.00, 'SENT', NULL, NULL, NULL, '2026-04-21 19:30:12.399', '2026-04-21 19:30:12.399');
INSERT INTO public."Invoice" VALUES ('cmo90qdww00wj8p8c82qtrxqi', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90jm85002x8p8co4ht7dw4', 'ELT-INV-20260014', '2026-03-19 20:30:12.847', '2026-05-26 19:30:12.847', 38600.00, 19.00, 7334.00, 45934.00, 19300.00, 'OVERDUE', NULL, NULL, NULL, '2026-04-21 19:30:12.848', '2026-04-21 19:30:12.848');


--
-- Data for Name: MaterialRequest; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MaterialRequest" VALUES ('cmo90n1b600hn8p8c0s0ujoy0', 'cmo90jru300388p8c1ire5mdf', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90jbmm002a8p8cukr7msxp', NULL, 65.00, 'PENDING', '2026-04-17 19:27:36.545', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:36.546', '2026-04-21 19:27:36.546');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n1y000hp8p8cfmk7me9n', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90ja3800298p8cqphzc1hi', 9.00, 'APPROVED', '2026-04-15 19:27:37.368', '2026-04-09 19:27:37.368', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:37.369', '2026-04-21 19:27:37.369');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n2iq00hr8p8ci2rfyndp', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90je36002c8p8c86e5snpa', 'cmo90jbmm002a8p8cukr7msxp', 49.00, 'REJECTED', '2026-04-10 19:27:38.113', '2026-04-06 19:27:38.113', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:38.114', '2026-04-21 19:27:38.114');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n37g00ht8p8ctgy17gvy', 'cmo90jum2003n8p8crdn2hbox', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90j8gd00288p8c5r5vhur3', 35.00, 'ISSUED', '2026-04-01 19:27:39.004', '2026-04-20 19:27:39.004', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:39.005', '2026-04-21 19:27:39.005');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n3v800hv8p8cnqz3n5qk', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90jbmm002a8p8cukr7msxp', NULL, 66.00, 'PENDING', '2026-03-13 20:27:39.859', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:39.86', '2026-04-21 19:27:39.86');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n4d800hx8p8coin2ck3c', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90lph700by8p8c2d4d9w17', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90jbmm002a8p8cukr7msxp', 74.00, 'APPROVED', '2026-03-20 20:27:40.508', '2026-04-15 19:27:40.508', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:40.509', '2026-04-21 19:27:40.509');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n4tj00hz8p8c8lmkgxpb', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90je36002c8p8c86e5snpa', 'cmo90j8gd00288p8c5r5vhur3', 24.00, 'REJECTED', '2026-04-08 19:27:41.095', '2026-04-17 19:27:41.095', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:41.096', '2026-04-21 19:27:41.096');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n5i000i18p8carcwcgro', 'cmo90k1in00478p8cxmksb7pr', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90ja3800298p8cqphzc1hi', 72.00, 'ISSUED', '2026-03-11 20:27:41.975', '2026-04-13 19:27:41.975', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:41.976', '2026-04-21 19:27:41.976');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n65w00i38p8c8bnsxvsf', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90jbmm002a8p8cukr7msxp', NULL, 39.00, 'PENDING', '2026-04-02 19:27:42.835', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:42.836', '2026-04-21 19:27:42.836');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n6og00i58p8cwrjf12ve', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90j8gd00288p8c5r5vhur3', 71.00, 'APPROVED', '2026-04-02 19:27:43.503', '2026-04-06 19:27:43.503', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:43.504', '2026-04-21 19:27:43.504');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n78500i78p8cteyg4m6g', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90je36002c8p8c86e5snpa', 'cmo90ja3800298p8cqphzc1hi', 41.00, 'REJECTED', '2026-04-20 19:27:44.134', '2026-04-14 19:27:44.134', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:44.134', '2026-04-21 19:27:44.134');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n7w600i98p8chxjl3o0a', 'cmo90k66y004r8p8c51np3e4s', 'cmo90lph700by8p8c2d4d9w17', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jbmm002a8p8cukr7msxp', 3.00, 'ISSUED', '2026-04-21 19:27:45.078', '2026-04-09 19:27:45.078', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:45.079', '2026-04-21 19:27:45.079');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n8cj00ib8p8cbaw8gro6', 'cmo90jru300388p8c1ire5mdf', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90jbmm002a8p8cukr7msxp', NULL, 59.00, 'PENDING', '2026-04-05 19:27:45.667', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:45.668', '2026-04-21 19:27:45.668');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n8pa00id8p8c4m7jo6u8', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90ja3800298p8cqphzc1hi', 3.00, 'APPROVED', '2026-04-11 19:27:46.125', '2026-04-16 19:27:46.125', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:46.126', '2026-04-21 19:27:46.126');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n91c00if8p8cvbcui6wx', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90je36002c8p8c86e5snpa', 'cmo90jbmm002a8p8cukr7msxp', 60.00, 'REJECTED', '2026-04-12 19:27:46.56', '2026-04-04 19:27:46.56', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:46.561', '2026-04-21 19:27:46.561');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n9fh00ih8p8cyarl7cuq', 'cmo90jum2003n8p8crdn2hbox', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90j8gd00288p8c5r5vhur3', 45.00, 'ISSUED', '2026-03-22 20:27:47.068', '2026-04-17 19:27:47.068', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:47.069', '2026-04-21 19:27:47.069');
INSERT INTO public."MaterialRequest" VALUES ('cmo90n9xj00ij8p8ccmmi4f92', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90jbmm002a8p8cukr7msxp', NULL, 44.00, 'PENDING', '2026-03-09 20:27:47.718', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:47.719', '2026-04-21 19:27:47.719');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nadt00il8p8ctq3dy4zk', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90lph700by8p8c2d4d9w17', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90jbmm002a8p8cukr7msxp', 4.00, 'APPROVED', '2026-03-10 20:27:48.304', '2026-04-03 19:27:48.304', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:48.305', '2026-04-21 19:27:48.305');
INSERT INTO public."MaterialRequest" VALUES ('cmo90narc00in8p8cybyfb878', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90je36002c8p8c86e5snpa', 'cmo90j8gd00288p8c5r5vhur3', 52.00, 'REJECTED', '2026-03-29 19:27:48.792', '2026-04-02 19:27:48.792', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:48.793', '2026-04-21 19:27:48.793');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nb3100ip8p8cjeohyzub', 'cmo90k1in00478p8cxmksb7pr', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90ja3800298p8cqphzc1hi', 70.00, 'ISSUED', '2026-04-14 19:27:49.213', '2026-04-14 19:27:49.213', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:49.214', '2026-04-21 19:27:49.214');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nbhn00ir8p8culou8s8a', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90jbmm002a8p8cukr7msxp', NULL, 49.00, 'PENDING', '2026-04-17 19:27:49.738', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:49.739', '2026-04-21 19:27:49.739');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nbue00it8p8c046hmid9', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90j8gd00288p8c5r5vhur3', 27.00, 'APPROVED', '2026-03-09 20:27:50.198', '2026-04-16 19:27:50.198', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:50.199', '2026-04-21 19:27:50.199');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nc7300iv8p8cmt2zf4dg', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90je36002c8p8c86e5snpa', 'cmo90ja3800298p8cqphzc1hi', 33.00, 'REJECTED', '2026-04-02 19:27:50.655', '2026-04-15 19:27:50.655', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:50.656', '2026-04-21 19:27:50.656');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ncit00ix8p8cewhzdu1n', 'cmo90k66y004r8p8c51np3e4s', 'cmo90lph700by8p8c2d4d9w17', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jbmm002a8p8cukr7msxp', 63.00, 'ISSUED', '2026-03-20 20:27:51.077', '2026-04-15 19:27:51.077', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:51.078', '2026-04-21 19:27:51.078');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ncxj00iz8p8csufwh88o', 'cmo90jru300388p8c1ire5mdf', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90jbmm002a8p8cukr7msxp', NULL, 11.00, 'PENDING', '2026-04-19 19:27:51.606', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:51.607', '2026-04-21 19:27:51.607');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ndac00j18p8czypexqhf', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90ja3800298p8cqphzc1hi', 66.00, 'APPROVED', '2026-03-08 20:27:52.067', '2026-04-07 19:27:52.067', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:52.068', '2026-04-21 19:27:52.068');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ndls00j38p8c6b8upd6l', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90je36002c8p8c86e5snpa', 'cmo90jbmm002a8p8cukr7msxp', 45.00, 'REJECTED', '2026-03-24 20:27:52.479', '2026-04-05 19:27:52.48', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:52.48', '2026-04-21 19:27:52.48');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ndxh00j58p8c0rowww5v', 'cmo90jum2003n8p8crdn2hbox', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90j8gd00288p8c5r5vhur3', 50.00, 'ISSUED', '2026-03-10 20:27:52.901', '2026-04-17 19:27:52.901', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:52.902', '2026-04-21 19:27:52.902');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nebb00j78p8ctdrr6ayq', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90jbmm002a8p8cukr7msxp', NULL, 15.00, 'PENDING', '2026-03-22 20:27:53.399', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:53.4', '2026-04-21 19:27:53.4');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nen700j98p8c7dy2gj05', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90lph700by8p8c2d4d9w17', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90jbmm002a8p8cukr7msxp', 49.00, 'APPROVED', '2026-04-10 19:27:53.827', '2026-04-04 19:27:53.827', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:53.828', '2026-04-21 19:27:53.828');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nf0o00jb8p8cgfk5ktiz', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90je36002c8p8c86e5snpa', 'cmo90j8gd00288p8c5r5vhur3', 24.00, 'REJECTED', '2026-04-14 19:27:54.311', '2026-04-01 19:27:54.311', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:54.312', '2026-04-21 19:27:54.312');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nfeg00jd8p8c7er78u04', 'cmo90k1in00478p8cxmksb7pr', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90ja3800298p8cqphzc1hi', 5.00, 'ISSUED', '2026-03-18 20:27:54.807', '2026-04-09 19:27:54.807', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:54.808', '2026-04-21 19:27:54.808');
INSERT INTO public."MaterialRequest" VALUES ('cmo90nfs400jf8p8czx81su8n', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90jbmm002a8p8cukr7msxp', NULL, 14.00, 'PENDING', '2026-03-25 20:27:55.299', NULL, 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:55.3', '2026-04-21 19:27:55.3');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ng5u00jh8p8c9m1yi4xa', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90jdce002b8p8cxqbo6s6q', 'cmo90j8gd00288p8c5r5vhur3', 40.00, 'APPROVED', '2026-04-02 19:27:55.794', '2026-04-01 19:27:55.794', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:55.795', '2026-04-21 19:27:55.795');
INSERT INTO public."MaterialRequest" VALUES ('cmo90ngib00jj8p8cqkgyy3fb', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90je36002c8p8c86e5snpa', 'cmo90ja3800298p8cqphzc1hi', 11.00, 'REJECTED', '2026-03-17 20:27:56.242', '2026-04-12 19:27:56.242', 'Cerere materiale generata pentru demo operational.', '2026-04-21 19:27:56.243', '2026-04-21 19:27:56.243');


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Notification" VALUES ('cmo90rr4j01288p8c3h68a60c', 'cmo90j7es00278p8c6ydj8ylc', 'NEW_ASSIGNMENT', 'Notificare operationala #1', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:16.628');
INSERT INTO public."Notification" VALUES ('cmo90rrhu012a8p8cuiriib9k', 'cmo90j8gd00288p8c5r5vhur3', 'OVERDUE_TASK', 'Notificare operationala #2', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:17.107');
INSERT INTO public."Notification" VALUES ('cmo90rs4j012c8p8cegnockg4', 'cmo90ja3800298p8cqphzc1hi', 'LOW_STOCK', 'Notificare operationala #3', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:17.924');
INSERT INTO public."Notification" VALUES ('cmo90rsjm012e8p8c628039nn', 'cmo90jbmm002a8p8cukr7msxp', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #4', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:18.466');
INSERT INTO public."Notification" VALUES ('cmo90rt7j012g8p8cg6ki0q1q', 'cmo90jdce002b8p8cxqbo6s6q', 'INVOICE_OVERDUE', 'Notificare operationala #5', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:19.048');
INSERT INTO public."Notification" VALUES ('cmo90rtsy012i8p8c2ay6ycy4', 'cmo90je36002c8p8c86e5snpa', 'NEW_ASSIGNMENT', 'Notificare operationala #6', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:20.099');
INSERT INTO public."Notification" VALUES ('cmo90rudy012k8p8cv3q1uuhf', 'cmo90jetj002d8p8c6fhl8jgg', 'OVERDUE_TASK', 'Notificare operationala #7', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:20.854');
INSERT INTO public."Notification" VALUES ('cmo90ruti012m8p8citq58mt5', 'cmo90jfyu002e8p8c7d5dflsm', 'LOW_STOCK', 'Notificare operationala #8', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:21.414');
INSERT INTO public."Notification" VALUES ('cmo90rvgb012o8p8cun88elkz', 'cmo90jgx0002f8p8ctbpzi1kv', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #9', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:22.235');
INSERT INTO public."Notification" VALUES ('cmo90rvxi012q8p8cx1ht0cpm', 'cmo90ji13002g8p8cooiuiwhs', 'INVOICE_OVERDUE', 'Notificare operationala #10', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:22.855');
INSERT INTO public."Notification" VALUES ('cmo90rwha012s8p8c09u4srn6', 'cmo90j7es00278p8c6ydj8ylc', 'NEW_ASSIGNMENT', 'Notificare operationala #11', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:23.567');
INSERT INTO public."Notification" VALUES ('cmo90rx3q012u8p8cl18edajm', 'cmo90j8gd00288p8c5r5vhur3', 'OVERDUE_TASK', 'Notificare operationala #12', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:24.374');
INSERT INTO public."Notification" VALUES ('cmo90rxj6012w8p8cg41ka0op', 'cmo90ja3800298p8cqphzc1hi', 'LOW_STOCK', 'Notificare operationala #13', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:24.931');
INSERT INTO public."Notification" VALUES ('cmo90ry41012y8p8cvo2p3orh', 'cmo90jbmm002a8p8cukr7msxp', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #14', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:25.681');
INSERT INTO public."Notification" VALUES ('cmo90ryga01308p8cnum4rbgc', 'cmo90jdce002b8p8cxqbo6s6q', 'INVOICE_OVERDUE', 'Notificare operationala #15', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:26.122');
INSERT INTO public."Notification" VALUES ('cmo90rysp01328p8crocp0vhf', 'cmo90je36002c8p8c86e5snpa', 'NEW_ASSIGNMENT', 'Notificare operationala #16', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:26.57');
INSERT INTO public."Notification" VALUES ('cmo90rz7s01348p8c0vq865j5', 'cmo90jetj002d8p8c6fhl8jgg', 'OVERDUE_TASK', 'Notificare operationala #17', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:27.112');
INSERT INTO public."Notification" VALUES ('cmo90rzjr01368p8c8taodeii', 'cmo90jfyu002e8p8c7d5dflsm', 'LOW_STOCK', 'Notificare operationala #18', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:27.543');
INSERT INTO public."Notification" VALUES ('cmo90rzwv01388p8cbihncv35', 'cmo90jgx0002f8p8ctbpzi1kv', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #19', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:28.016');
INSERT INTO public."Notification" VALUES ('cmo90s08d013a8p8c11tn33e3', 'cmo90ji13002g8p8cooiuiwhs', 'INVOICE_OVERDUE', 'Notificare operationala #20', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:28.429');
INSERT INTO public."Notification" VALUES ('cmo90s0kv013c8p8cf3tz5mxs', 'cmo90j7es00278p8c6ydj8ylc', 'NEW_ASSIGNMENT', 'Notificare operationala #21', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:28.88');
INSERT INTO public."Notification" VALUES ('cmo90s15i013e8p8cx431fukq', 'cmo90j8gd00288p8c5r5vhur3', 'OVERDUE_TASK', 'Notificare operationala #22', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:29.622');
INSERT INTO public."Notification" VALUES ('cmo90s1j4013g8p8ctr647z9i', 'cmo90ja3800298p8cqphzc1hi', 'LOW_STOCK', 'Notificare operationala #23', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:30.112');
INSERT INTO public."Notification" VALUES ('cmo90s1ve013i8p8csse49b9w', 'cmo90jbmm002a8p8cukr7msxp', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #24', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:30.555');
INSERT INTO public."Notification" VALUES ('cmo90s27y013k8p8cwhichk0l', 'cmo90jdce002b8p8cxqbo6s6q', 'INVOICE_OVERDUE', 'Notificare operationala #25', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:31.007');
INSERT INTO public."Notification" VALUES ('cmo90s2m0013m8p8c4kbdqcv6', 'cmo90je36002c8p8c86e5snpa', 'NEW_ASSIGNMENT', 'Notificare operationala #26', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:31.512');
INSERT INTO public."Notification" VALUES ('cmo90s2yy013o8p8cm7plundx', 'cmo90jetj002d8p8c6fhl8jgg', 'OVERDUE_TASK', 'Notificare operationala #27', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:31.978');
INSERT INTO public."Notification" VALUES ('cmo90s3ab013q8p8creff4z3x', 'cmo90jfyu002e8p8c7d5dflsm', 'LOW_STOCK', 'Notificare operationala #28', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:32.388');
INSERT INTO public."Notification" VALUES ('cmo90s3n7013s8p8c5384r8r6', 'cmo90jgx0002f8p8ctbpzi1kv', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #29', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:32.851');
INSERT INTO public."Notification" VALUES ('cmo90s3zo013u8p8c4zpdq4rw', 'cmo90ji13002g8p8cooiuiwhs', 'INVOICE_OVERDUE', 'Notificare operationala #30', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:33.301');
INSERT INTO public."Notification" VALUES ('cmo90s4c1013w8p8car5lytrg', 'cmo90j7es00278p8c6ydj8ylc', 'NEW_ASSIGNMENT', 'Notificare operationala #31', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:33.746');
INSERT INTO public."Notification" VALUES ('cmo90s4q6013y8p8ca9jm1y3e', 'cmo90j8gd00288p8c5r5vhur3', 'OVERDUE_TASK', 'Notificare operationala #32', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:34.254');
INSERT INTO public."Notification" VALUES ('cmo90s54t01408p8c9qcuar6i', 'cmo90ja3800298p8cqphzc1hi', 'LOW_STOCK', 'Notificare operationala #33', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:34.705');
INSERT INTO public."Notification" VALUES ('cmo90s5ij01428p8cswzu60xh', 'cmo90jbmm002a8p8cukr7msxp', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #34', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:35.275');
INSERT INTO public."Notification" VALUES ('cmo90s5tw01448p8c5vc0ybbq', 'cmo90jdce002b8p8cxqbo6s6q', 'INVOICE_OVERDUE', 'Notificare operationala #35', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:35.684');
INSERT INTO public."Notification" VALUES ('cmo90s6jb01468p8cbj8z9uxh', 'cmo90je36002c8p8c86e5snpa', 'NEW_ASSIGNMENT', 'Notificare operationala #36', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:36.6');
INSERT INTO public."Notification" VALUES ('cmo90s7bd01488p8c48iyhz9o', 'cmo90jetj002d8p8c6fhl8jgg', 'OVERDUE_TASK', 'Notificare operationala #37', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:37.609');
INSERT INTO public."Notification" VALUES ('cmo90s7r8014a8p8cczjdzygj', 'cmo90jfyu002e8p8c7d5dflsm', 'LOW_STOCK', 'Notificare operationala #38', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:38.181');
INSERT INTO public."Notification" VALUES ('cmo90s8c1014c8p8ckumjiyix', 'cmo90jgx0002f8p8ctbpzi1kv', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #39', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:38.93');
INSERT INTO public."Notification" VALUES ('cmo90s8vx014e8p8clw8heco7', 'cmo90ji13002g8p8cooiuiwhs', 'INVOICE_OVERDUE', 'Notificare operationala #40', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:39.645');
INSERT INTO public."Notification" VALUES ('cmo90s9g6014g8p8c4qvzsxe7', 'cmo90j7es00278p8c6ydj8ylc', 'NEW_ASSIGNMENT', 'Notificare operationala #41', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:40.375');
INSERT INTO public."Notification" VALUES ('cmo90s9w9014i8p8cag2c8c81', 'cmo90j8gd00288p8c5r5vhur3', 'OVERDUE_TASK', 'Notificare operationala #42', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:40.953');
INSERT INTO public."Notification" VALUES ('cmo90sadg014k8p8c9ew3tgpr', 'cmo90ja3800298p8cqphzc1hi', 'LOW_STOCK', 'Notificare operationala #43', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:41.573');
INSERT INTO public."Notification" VALUES ('cmo90sb0d014m8p8cq6u1xp1j', 'cmo90jbmm002a8p8cukr7msxp', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #44', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:42.398');
INSERT INTO public."Notification" VALUES ('cmo90sbnk014o8p8c0mab0duh', 'cmo90jdce002b8p8cxqbo6s6q', 'INVOICE_OVERDUE', 'Notificare operationala #45', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:43.233');
INSERT INTO public."Notification" VALUES ('cmo90sc8u014q8p8cdwe4hapm', 'cmo90je36002c8p8c86e5snpa', 'NEW_ASSIGNMENT', 'Notificare operationala #46', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:43.999');
INSERT INTO public."Notification" VALUES ('cmo90sd0x014s8p8csp1vqywj', 'cmo90jetj002d8p8c6fhl8jgg', 'OVERDUE_TASK', 'Notificare operationala #47', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:45.01');
INSERT INTO public."Notification" VALUES ('cmo90sdjq014u8p8cgazhzmuj', 'cmo90jfyu002e8p8c7d5dflsm', 'LOW_STOCK', 'Notificare operationala #48', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:45.686');
INSERT INTO public."Notification" VALUES ('cmo90sdy1014w8p8csn96ac8s', 'cmo90jgx0002f8p8ctbpzi1kv', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #49', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:46.202');
INSERT INTO public."Notification" VALUES ('cmo90seba014y8p8c0pjx40aw', 'cmo90ji13002g8p8cooiuiwhs', 'INVOICE_OVERDUE', 'Notificare operationala #50', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:46.678');
INSERT INTO public."Notification" VALUES ('cmo90sf0q01528p8cdg5okpp2', 'cmo90j8gd00288p8c5r5vhur3', 'OVERDUE_TASK', 'Notificare operationala #52', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:47.595');
INSERT INTO public."Notification" VALUES ('cmo90sfhq01548p8ckzoptfkg', 'cmo90ja3800298p8cqphzc1hi', 'LOW_STOCK', 'Notificare operationala #53', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:48.207');
INSERT INTO public."Notification" VALUES ('cmo90sftw01568p8cvmwfqnm4', 'cmo90jbmm002a8p8cukr7msxp', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #54', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:48.644');
INSERT INTO public."Notification" VALUES ('cmo90sg4q01588p8cobew2vao', 'cmo90jdce002b8p8cxqbo6s6q', 'INVOICE_OVERDUE', 'Notificare operationala #55', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:49.034');
INSERT INTO public."Notification" VALUES ('cmo90sghe015a8p8cqagsdezx', 'cmo90je36002c8p8c86e5snpa', 'NEW_ASSIGNMENT', 'Notificare operationala #56', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:49.49');
INSERT INTO public."Notification" VALUES ('cmo90sgx0015c8p8cmhvrgxj6', 'cmo90jetj002d8p8c6fhl8jgg', 'OVERDUE_TASK', 'Notificare operationala #57', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:49.973');
INSERT INTO public."Notification" VALUES ('cmo90shaq015e8p8claxy46wl', 'cmo90jfyu002e8p8c7d5dflsm', 'LOW_STOCK', 'Notificare operationala #58', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:50.547');
INSERT INTO public."Notification" VALUES ('cmo90shmj015g8p8cx8yxx7ad', 'cmo90jgx0002f8p8ctbpzi1kv', 'TIMESHEET_APPROVAL_REQUIRED', 'Notificare operationala #59', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:50.972');
INSERT INTO public."Notification" VALUES ('cmo90si0a015i8p8c7l7kmiw3', 'cmo90ji13002g8p8cooiuiwhs', 'INVOICE_OVERDUE', 'Notificare operationala #60', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', false, '/panou', '2026-04-21 19:31:51.467');
INSERT INTO public."Notification" VALUES ('cmo90seok01508p8c5r06xgms', 'cmo90j7es00278p8c6ydj8ylc', 'NEW_ASSIGNMENT', 'Notificare operationala #51', 'Exista un element care necesita atentie in platforma ELTGRUP Manager.', true, '/panou', '2026-04-21 19:31:47.157');


--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."StockMovement" VALUES ('cmo90lqxg00c38p8cj604n370', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 94.00, 79.00, NULL, 'Miscare stoc automata seed', '2026-03-24 20:26:36.436', '2026-04-21 19:26:36.437');
INSERT INTO public."StockMovement" VALUES ('cmo90lraj00c58p8c076lzf2w', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 67.00, 15.00, NULL, 'Miscare stoc automata seed', '2026-03-07 20:26:36.907', '2026-04-21 19:26:36.908');
INSERT INTO public."StockMovement" VALUES ('cmo90lrt200c78p8ch79lt90g', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 127.00, 33.00, NULL, 'Miscare stoc automata seed', '2026-03-14 20:26:37.573', '2026-04-21 19:26:37.574');
INSERT INTO public."StockMovement" VALUES ('cmo90lsbe00c98p8cxkdz8ib1', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 51.00, 54.00, NULL, 'Miscare stoc automata seed', '2026-03-06 20:26:38.233', '2026-04-21 19:26:38.234');
INSERT INTO public."StockMovement" VALUES ('cmo90lsw100cb8p8cyltbbfyz', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 10.00, 25.00, NULL, 'Miscare stoc automata seed', '2026-02-20 20:26:38.977', '2026-04-21 19:26:38.978');
INSERT INTO public."StockMovement" VALUES ('cmo90ltja00cd8p8czvmzytsi', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 9.00, 28.00, NULL, 'Miscare stoc automata seed', '2026-04-19 19:26:39.814', '2026-04-21 19:26:39.815');
INSERT INTO public."StockMovement" VALUES ('cmo90lu4f00cf8p8c6ju68utc', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 141.00, 69.00, NULL, 'Miscare stoc automata seed', '2026-03-27 20:26:40.575', '2026-04-21 19:26:40.576');
INSERT INTO public."StockMovement" VALUES ('cmo90lukh00ch8p8ch7n19zvi', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 148.00, 46.00, NULL, 'Miscare stoc automata seed', '2026-02-28 20:26:41.153', '2026-04-21 19:26:41.154');
INSERT INTO public."StockMovement" VALUES ('cmo90lvr200cj8p8ce517ky9c', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 103.00, 94.00, NULL, 'Miscare stoc automata seed', '2026-03-09 20:26:42.6', '2026-04-21 19:26:42.601');
INSERT INTO public."StockMovement" VALUES ('cmo90lwlz00cl8p8crr7lfj6k', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 106.00, 43.00, NULL, 'Miscare stoc automata seed', '2026-02-25 20:26:43.799', '2026-04-21 19:26:43.799');
INSERT INTO public."StockMovement" VALUES ('cmo90lxet00cn8p8cvq7g8oqo', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 94.00, 43.00, NULL, 'Miscare stoc automata seed', '2026-03-26 20:26:44.836', '2026-04-21 19:26:44.837');
INSERT INTO public."StockMovement" VALUES ('cmo90ly6900cp8p8cm5l09fcs', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 37.00, 95.00, NULL, 'Miscare stoc automata seed', '2026-03-11 20:26:45.824', '2026-04-21 19:26:45.825');
INSERT INTO public."StockMovement" VALUES ('cmo90lyku00cr8p8c881v6489', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 113.00, 93.00, NULL, 'Miscare stoc automata seed', '2026-03-13 20:26:46.35', '2026-04-21 19:26:46.35');
INSERT INTO public."StockMovement" VALUES ('cmo90lywz00ct8p8cs6kr2ivo', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 80.00, 68.00, NULL, 'Miscare stoc automata seed', '2026-04-06 19:26:46.786', '2026-04-21 19:26:46.787');
INSERT INTO public."StockMovement" VALUES ('cmo90lz9p00cv8p8clczxlpn4', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 136.00, 63.00, NULL, 'Miscare stoc automata seed', '2026-04-06 19:26:47.245', '2026-04-21 19:26:47.246');
INSERT INTO public."StockMovement" VALUES ('cmo90lzn200cx8p8cuwjndjwn', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 122.00, 29.00, NULL, 'Miscare stoc automata seed', '2026-03-10 20:26:47.726', '2026-04-21 19:26:47.726');
INSERT INTO public."StockMovement" VALUES ('cmo90m00m00cz8p8cpcsjo9vc', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 127.00, 98.00, NULL, 'Miscare stoc automata seed', '2026-03-20 20:26:48.214', '2026-04-21 19:26:48.215');
INSERT INTO public."StockMovement" VALUES ('cmo90m0cb00d18p8cfznswrcd', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 22.00, 97.00, NULL, 'Miscare stoc automata seed', '2026-03-25 20:26:48.635', '2026-04-21 19:26:48.636');
INSERT INTO public."StockMovement" VALUES ('cmo90m0uv00d38p8c23m6omrs', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 56.00, 64.00, NULL, 'Miscare stoc automata seed', '2026-03-08 20:26:49.303', '2026-04-21 19:26:49.304');
INSERT INTO public."StockMovement" VALUES ('cmo90m1c700d58p8cbaf8pppp', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 16.00, 9.00, NULL, 'Miscare stoc automata seed', '2026-04-10 19:26:49.927', '2026-04-21 19:26:49.927');
INSERT INTO public."StockMovement" VALUES ('cmo90m1om00d78p8cqqe4hebv', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 58.00, 57.00, NULL, 'Miscare stoc automata seed', '2026-03-24 20:26:50.374', '2026-04-21 19:26:50.375');
INSERT INTO public."StockMovement" VALUES ('cmo90m22u00d98p8cm13b81mq', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 113.00, 98.00, NULL, 'Miscare stoc automata seed', '2026-03-30 19:26:50.886', '2026-04-21 19:26:50.887');
INSERT INTO public."StockMovement" VALUES ('cmo90m2eq00db8p8ck2vo11fn', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 46.00, 95.00, NULL, 'Miscare stoc automata seed', '2026-04-06 19:26:51.314', '2026-04-21 19:26:51.315');
INSERT INTO public."StockMovement" VALUES ('cmo90m2s400dd8p8cfwkbhqcf', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 98.00, 95.00, NULL, 'Miscare stoc automata seed', '2026-02-24 20:26:51.796', '2026-04-21 19:26:51.797');
INSERT INTO public."StockMovement" VALUES ('cmo90m36500df8p8c5dlsubph', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 98.00, 50.00, NULL, 'Miscare stoc automata seed', '2026-03-17 20:26:52.301', '2026-04-21 19:26:52.302');
INSERT INTO public."StockMovement" VALUES ('cmo90m3im00dh8p8cafunfidd', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 100.00, 59.00, NULL, 'Miscare stoc automata seed', '2026-04-01 19:26:52.749', '2026-04-21 19:26:52.75');
INSERT INTO public."StockMovement" VALUES ('cmo90m3uk00dj8p8c9u5i2h2o', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 146.00, 51.00, NULL, 'Miscare stoc automata seed', '2026-03-14 20:26:53.179', '2026-04-21 19:26:53.18');
INSERT INTO public."StockMovement" VALUES ('cmo90m49300dl8p8chqv3sq3h', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 56.00, 12.00, NULL, 'Miscare stoc automata seed', '2026-03-17 20:26:53.702', '2026-04-21 19:26:53.703');
INSERT INTO public."StockMovement" VALUES ('cmo90m4lm00dn8p8ccdet483n', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 90.00, 14.00, NULL, 'Miscare stoc automata seed', '2026-04-02 19:26:54.153', '2026-04-21 19:26:54.154');
INSERT INTO public."StockMovement" VALUES ('cmo90m4yc00dp8p8cheamkfzp', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 99.00, 99.00, NULL, 'Miscare stoc automata seed', '2026-02-22 20:26:54.612', '2026-04-21 19:26:54.613');
INSERT INTO public."StockMovement" VALUES ('cmo90m5fq00dr8p8cjvpknav6', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 147.00, 89.00, NULL, 'Miscare stoc automata seed', '2026-03-14 20:26:55.238', '2026-04-21 19:26:55.239');
INSERT INTO public."StockMovement" VALUES ('cmo90m5t000dt8p8cpw5fn5v0', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 19.00, 23.00, NULL, 'Miscare stoc automata seed', '2026-04-16 19:26:55.716', '2026-04-21 19:26:55.717');
INSERT INTO public."StockMovement" VALUES ('cmo90m69500dv8p8c8tfuldz3', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 42.00, 41.00, NULL, 'Miscare stoc automata seed', '2026-04-17 19:26:56.297', '2026-04-21 19:26:56.297');
INSERT INTO public."StockMovement" VALUES ('cmo90m6l100dx8p8c8bq23q4o', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 50.00, 90.00, NULL, 'Miscare stoc automata seed', '2026-03-31 19:26:56.724', '2026-04-21 19:26:56.725');
INSERT INTO public."StockMovement" VALUES ('cmo90m71v00dz8p8cvrxxb9gm', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 127.00, 52.00, NULL, 'Miscare stoc automata seed', '2026-03-28 20:26:57.331', '2026-04-21 19:26:57.331');
INSERT INTO public."StockMovement" VALUES ('cmo90m7r600e18p8c5vmj93kf', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 6.00, 30.00, NULL, 'Miscare stoc automata seed', '2026-03-22 20:26:58.056', '2026-04-21 19:26:58.057');
INSERT INTO public."StockMovement" VALUES ('cmo90m89c00e38p8czzar2z5m', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 17.00, 86.00, NULL, 'Miscare stoc automata seed', '2026-02-26 20:26:58.896', '2026-04-21 19:26:58.897');
INSERT INTO public."StockMovement" VALUES ('cmo90m8nb00e58p8cwaowucqe', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 5.00, 80.00, NULL, 'Miscare stoc automata seed', '2026-02-24 20:26:59.398', '2026-04-21 19:26:59.399');
INSERT INTO public."StockMovement" VALUES ('cmo90m98y00e78p8c3cj1kg0f', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 40.00, 24.00, NULL, 'Miscare stoc automata seed', '2026-02-22 20:27:00.178', '2026-04-21 19:27:00.178');
INSERT INTO public."StockMovement" VALUES ('cmo90m9p000e98p8c9vzqsc84', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 138.00, 71.00, NULL, 'Miscare stoc automata seed', '2026-04-17 19:27:00.755', '2026-04-21 19:27:00.756');
INSERT INTO public."StockMovement" VALUES ('cmo90ma6800eb8p8chix30r67', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 63.00, 41.00, NULL, 'Miscare stoc automata seed', '2026-03-05 20:27:01.376', '2026-04-21 19:27:01.377');
INSERT INTO public."StockMovement" VALUES ('cmo90mavk00ed8p8ceo8a8763', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 64.00, 42.00, NULL, 'Miscare stoc automata seed', '2026-03-20 20:27:02.287', '2026-04-21 19:27:02.288');
INSERT INTO public."StockMovement" VALUES ('cmo90mbe800ef8p8cnhdn005f', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 79.00, 36.00, NULL, 'Miscare stoc automata seed', '2026-03-07 20:27:02.959', '2026-04-21 19:27:02.96');
INSERT INTO public."StockMovement" VALUES ('cmo90mc1q00eh8p8cw4se3d01', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 50.00, 93.00, NULL, 'Miscare stoc automata seed', '2026-03-19 20:27:03.806', '2026-04-21 19:27:03.806');
INSERT INTO public."StockMovement" VALUES ('cmo90mcjr00ej8p8cwlowe3ty', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 88.00, 95.00, NULL, 'Miscare stoc automata seed', '2026-04-10 19:27:04.455', '2026-04-21 19:27:04.456');
INSERT INTO public."StockMovement" VALUES ('cmo90md2a00el8p8c4dqyemqa', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 60.00, 55.00, NULL, 'Miscare stoc automata seed', '2026-03-07 20:27:05.121', '2026-04-21 19:27:05.122');
INSERT INTO public."StockMovement" VALUES ('cmo90mdhr00en8p8c2qlregmq', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 103.00, 53.00, NULL, 'Miscare stoc automata seed', '2026-04-07 19:27:05.678', '2026-04-21 19:27:05.679');
INSERT INTO public."StockMovement" VALUES ('cmo90mdv800ep8p8ct0dnsqgo', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 137.00, 10.00, NULL, 'Miscare stoc automata seed', '2026-03-19 20:27:06.163', '2026-04-21 19:27:06.164');
INSERT INTO public."StockMovement" VALUES ('cmo90me8m00er8p8c8fv7nnk1', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 73.00, 68.00, NULL, 'Miscare stoc automata seed', '2026-03-11 20:27:06.646', '2026-04-21 19:27:06.647');
INSERT INTO public."StockMovement" VALUES ('cmo90mens00et8p8c88a93q6r', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 95.00, 58.00, NULL, 'Miscare stoc automata seed', '2026-04-07 19:27:07.191', '2026-04-21 19:27:07.192');
INSERT INTO public."StockMovement" VALUES ('cmo90mf9300ev8p8cmcmwwh1k', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 103.00, 77.00, NULL, 'Miscare stoc automata seed', '2026-04-19 19:27:07.959', '2026-04-21 19:27:07.96');
INSERT INTO public."StockMovement" VALUES ('cmo90mflv00ex8p8cco86arc5', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 142.00, 89.00, NULL, 'Miscare stoc automata seed', '2026-02-23 20:27:08.418', '2026-04-21 19:27:08.419');
INSERT INTO public."StockMovement" VALUES ('cmo90mfxe00ez8p8cjgrcmmsr', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 114.00, 23.00, NULL, 'Miscare stoc automata seed', '2026-02-23 20:27:08.833', '2026-04-21 19:27:08.834');
INSERT INTO public."StockMovement" VALUES ('cmo90mgch00f18p8cfjk6s5s6', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 104.00, 66.00, NULL, 'Miscare stoc automata seed', '2026-03-30 19:27:09.377', '2026-04-21 19:27:09.378');
INSERT INTO public."StockMovement" VALUES ('cmo90mgop00f38p8c6at1a90v', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 6.00, 99.00, NULL, 'Miscare stoc automata seed', '2026-03-03 20:27:09.816', '2026-04-21 19:27:09.817');
INSERT INTO public."StockMovement" VALUES ('cmo90mh1p00f58p8cartfwubh', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 57.00, 53.00, NULL, 'Miscare stoc automata seed', '2026-03-19 20:27:10.285', '2026-04-21 19:27:10.286');
INSERT INTO public."StockMovement" VALUES ('cmo90mhek00f78p8cdzr33z23', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 58.00, 18.00, NULL, 'Miscare stoc automata seed', '2026-03-26 20:27:10.748', '2026-04-21 19:27:10.749');
INSERT INTO public."StockMovement" VALUES ('cmo90mhss00f98p8cz9e3khso', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 141.00, 82.00, NULL, 'Miscare stoc automata seed', '2026-03-13 20:27:11.26', '2026-04-21 19:27:11.26');
INSERT INTO public."StockMovement" VALUES ('cmo90mi5h00fb8p8cd6j645g3', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 34.00, 67.00, NULL, 'Miscare stoc automata seed', '2026-02-25 20:27:11.717', '2026-04-21 19:27:11.718');
INSERT INTO public."StockMovement" VALUES ('cmo90mihy00fd8p8c1y9d0o40', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 70.00, 11.00, NULL, 'Miscare stoc automata seed', '2026-02-21 20:27:12.166', '2026-04-21 19:27:12.167');
INSERT INTO public."StockMovement" VALUES ('cmo90mivv00ff8p8cqc3chdvt', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 79.00, 25.00, NULL, 'Miscare stoc automata seed', '2026-03-09 20:27:12.667', '2026-04-21 19:27:12.668');
INSERT INTO public."StockMovement" VALUES ('cmo90mjg700fh8p8crh56xsrl', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 114.00, 69.00, NULL, 'Miscare stoc automata seed', '2026-04-02 19:27:13.316', '2026-04-21 19:27:13.317');
INSERT INTO public."StockMovement" VALUES ('cmo90mjte00fj8p8ck02rh1af', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 72.00, 56.00, NULL, 'Miscare stoc automata seed', '2026-04-13 19:27:13.874', '2026-04-21 19:27:13.874');
INSERT INTO public."StockMovement" VALUES ('cmo90mk6p00fl8p8cf8l7g7t1', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 80.00, 98.00, NULL, 'Miscare stoc automata seed', '2026-03-02 20:27:14.353', '2026-04-21 19:27:14.354');
INSERT INTO public."StockMovement" VALUES ('cmo90mkjl00fn8p8c6pipd1nd', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 45.00, 32.00, NULL, 'Miscare stoc automata seed', '2026-02-22 20:27:14.817', '2026-04-21 19:27:14.818');
INSERT INTO public."StockMovement" VALUES ('cmo90mkx600fp8p8cxj79b63u', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 113.00, 78.00, NULL, 'Miscare stoc automata seed', '2026-04-17 19:27:15.306', '2026-04-21 19:27:15.307');
INSERT INTO public."StockMovement" VALUES ('cmo90ml9u00fr8p8cgzlvwonk', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 145.00, 90.00, NULL, 'Miscare stoc automata seed', '2026-03-10 20:27:15.762', '2026-04-21 19:27:15.762');
INSERT INTO public."StockMovement" VALUES ('cmo90mlpq00ft8p8cpqi0tf8o', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 17.00, 47.00, NULL, 'Miscare stoc automata seed', '2026-04-07 19:27:16.334', '2026-04-21 19:27:16.335');
INSERT INTO public."StockMovement" VALUES ('cmo90mm2900fv8p8cjr9yhnpz', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 6.00, 50.00, NULL, 'Miscare stoc automata seed', '2026-03-04 20:27:16.784', '2026-04-21 19:27:16.785');
INSERT INTO public."StockMovement" VALUES ('cmo90mmne00fx8p8cc14lcbq2', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 39.00, 24.00, NULL, 'Miscare stoc automata seed', '2026-03-25 20:27:17.546', '2026-04-21 19:27:17.547');
INSERT INTO public."StockMovement" VALUES ('cmo90mn8v00fz8p8chdsz0ego', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 70.00, 53.00, NULL, 'Miscare stoc automata seed', '2026-04-20 19:27:18.319', '2026-04-21 19:27:18.32');
INSERT INTO public."StockMovement" VALUES ('cmo90mntu00g18p8cbzkuwupc', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 72.00, 58.00, NULL, 'Miscare stoc automata seed', '2026-03-15 20:27:19.074', '2026-04-21 19:27:19.075');
INSERT INTO public."StockMovement" VALUES ('cmo90moe200g38p8cxtpc15k5', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 109.00, 28.00, NULL, 'Miscare stoc automata seed', '2026-03-17 20:27:19.802', '2026-04-21 19:27:19.803');
INSERT INTO public."StockMovement" VALUES ('cmo90mouh00g58p8ckoju9tli', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 119.00, 5.00, NULL, 'Miscare stoc automata seed', '2026-04-18 19:27:20.393', '2026-04-21 19:27:20.393');
INSERT INTO public."StockMovement" VALUES ('cmo90mpa200g78p8cn6injd9y', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 97.00, 22.00, NULL, 'Miscare stoc automata seed', '2026-03-20 20:27:20.954', '2026-04-21 19:27:20.955');
INSERT INTO public."StockMovement" VALUES ('cmo90mq7200g98p8co5fyhsnh', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 35.00, 73.00, NULL, 'Miscare stoc automata seed', '2026-02-20 20:27:22.142', '2026-04-21 19:27:22.143');
INSERT INTO public."StockMovement" VALUES ('cmo90mr3l00gb8p8cn0t7uf9d', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 92.00, 27.00, NULL, 'Miscare stoc automata seed', '2026-03-02 20:27:23.313', '2026-04-21 19:27:23.314');
INSERT INTO public."StockMovement" VALUES ('cmo90mro500gd8p8c16ffqa8x', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 131.00, 81.00, NULL, 'Miscare stoc automata seed', '2026-04-07 19:27:24.053', '2026-04-21 19:27:24.053');
INSERT INTO public."StockMovement" VALUES ('cmo90mso900gf8p8ceuurrin7', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 19.00, 89.00, NULL, 'Miscare stoc automata seed', '2026-04-19 19:27:25.353', '2026-04-21 19:27:25.354');
INSERT INTO public."StockMovement" VALUES ('cmo90mt2u00gh8p8c99173izn', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 58.00, 96.00, NULL, 'Miscare stoc automata seed', '2026-03-24 20:27:25.877', '2026-04-21 19:27:25.878');
INSERT INTO public."StockMovement" VALUES ('cmo90mtfs00gj8p8c6w0kre7q', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 111.00, 11.00, NULL, 'Miscare stoc automata seed', '2026-03-28 20:27:26.343', '2026-04-21 19:27:26.344');
INSERT INTO public."StockMovement" VALUES ('cmo90mtso00gl8p8c927ie7mg', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 76.00, 86.00, NULL, 'Miscare stoc automata seed', '2026-03-20 20:27:26.807', '2026-04-21 19:27:26.808');
INSERT INTO public."StockMovement" VALUES ('cmo90mu5a00gn8p8cxyesy7ui', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 85.00, 32.00, NULL, 'Miscare stoc automata seed', '2026-03-17 20:27:27.261', '2026-04-21 19:27:27.262');
INSERT INTO public."StockMovement" VALUES ('cmo90mulj00gp8p8cl6pa3c2o', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 79.00, 20.00, NULL, 'Miscare stoc automata seed', '2026-03-15 20:27:27.847', '2026-04-21 19:27:27.848');
INSERT INTO public."StockMovement" VALUES ('cmo90mv0j00gr8p8cpfqqiusp', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 10.00, 98.00, NULL, 'Miscare stoc automata seed', '2026-04-05 19:27:28.386', '2026-04-21 19:27:28.387');
INSERT INTO public."StockMovement" VALUES ('cmo90mvgm00gt8p8cmtoeev49', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 76.00, 46.00, NULL, 'Miscare stoc automata seed', '2026-02-20 20:27:28.877', '2026-04-21 19:27:28.878');
INSERT INTO public."StockMovement" VALUES ('cmo90mvsg00gv8p8cbbeqy6hp', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 80.00, 66.00, NULL, 'Miscare stoc automata seed', '2026-02-26 20:27:29.392', '2026-04-21 19:27:29.393');
INSERT INTO public."StockMovement" VALUES ('cmo90mw6r00gx8p8cwuzgvnho', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 98.00, 94.00, NULL, 'Miscare stoc automata seed', '2026-03-12 20:27:29.906', '2026-04-21 19:27:29.907');
INSERT INTO public."StockMovement" VALUES ('cmo90mwk100gz8p8ckl50jln9', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jvhh003s8p8cea5xvr00', 'IN', 145.00, 45.00, NULL, 'Miscare stoc automata seed', '2026-04-10 19:27:30.385', '2026-04-21 19:27:30.386');
INSERT INTO public."StockMovement" VALUES ('cmo90mwx500h18p8c7lsd4tci', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jw9o003x8p8cfu1ajyh1', 'OUT', 83.00, 83.00, NULL, 'Miscare stoc automata seed', '2026-04-15 19:27:30.857', '2026-04-21 19:27:30.858');
INSERT INTO public."StockMovement" VALUES ('cmo90mx8x00h38p8cy01jux35', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jyvq00428p8cx3o0km3g', 'WASTE', 127.00, 22.00, NULL, 'Miscare stoc automata seed', '2026-03-26 20:27:31.281', '2026-04-21 19:27:31.281');
INSERT INTO public."StockMovement" VALUES ('cmo90mxl400h58p8chjce8l5d', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k1in00478p8cxmksb7pr', 'RETURN', 70.00, 35.00, NULL, 'Miscare stoc automata seed', '2026-03-03 20:27:31.719', '2026-04-21 19:27:31.72');
INSERT INTO public."StockMovement" VALUES ('cmo90my3o00h78p8ca74vq0ec', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k2n4004c8p8cnr3rna98', 'IN', 35.00, 15.00, NULL, 'Miscare stoc automata seed', '2026-04-18 19:27:32.388', '2026-04-21 19:27:32.389');
INSERT INTO public."StockMovement" VALUES ('cmo90myj300h98p8cq9tnxdqq', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90k3s1004h8p8cwg75w5pi', 'OUT', 34.00, 81.00, NULL, 'Miscare stoc automata seed', '2026-04-12 19:27:32.943', '2026-04-21 19:27:32.944');
INSERT INTO public."StockMovement" VALUES ('cmo90myvl00hb8p8ctch33gis', 'cmo90lp3700bx8p8c16u0tnbd', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90k4ve004m8p8cxmgwdlsa', 'WASTE', 131.00, 63.00, NULL, 'Miscare stoc automata seed', '2026-03-11 20:27:33.392', '2026-04-21 19:27:33.393');
INSERT INTO public."StockMovement" VALUES ('cmo90mz8v00hd8p8celmgmbq2', 'cmo90lph700by8p8c2d4d9w17', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90k66y004r8p8c51np3e4s', 'RETURN', 47.00, 54.00, NULL, 'Miscare stoc automata seed', '2026-03-08 20:27:33.871', '2026-04-21 19:27:33.872');
INSERT INTO public."StockMovement" VALUES ('cmo90mzlq00hf8p8c3hik7ek4', 'cmo90lnnh00bt8p8ce8oncgk8', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jru300388p8c1ire5mdf', 'IN', 41.00, 45.00, NULL, 'Miscare stoc automata seed', '2026-04-15 19:27:34.334', '2026-04-21 19:27:34.335');
INSERT INTO public."StockMovement" VALUES ('cmo90mzz600hh8p8cydfsxm9u', 'cmo90lo0900bu8p8ci2hxyzc2', 'cmo90lq6h00c08p8c0yoydblf', 'cmo90jsuh003d8p8cnpiz3rtb', 'OUT', 148.00, 86.00, NULL, 'Miscare stoc automata seed', '2026-03-10 20:27:34.818', '2026-04-21 19:27:34.819');
INSERT INTO public."StockMovement" VALUES ('cmo90n0k200hj8p8cxypyby9b', 'cmo90lod800bv8p8c8mdvlxvt', 'cmo90lqkz00c18p8cj6e8ppbr', 'cmo90jtqk003i8p8cibxkcwtl', 'WASTE', 118.00, 83.00, NULL, 'Miscare stoc automata seed', '2026-03-22 20:27:35.57', '2026-04-21 19:27:35.57');
INSERT INTO public."StockMovement" VALUES ('cmo90n0ww00hl8p8chg92bhsi', 'cmo90lopb00bw8p8cuakjr5uf', 'cmo90lpty00bz8p8c39l0qvlz', 'cmo90jum2003n8p8crdn2hbox', 'RETURN', 27.00, 20.00, NULL, 'Miscare stoc automata seed', '2026-03-26 20:27:36.032', '2026-04-21 19:27:36.033');


--
-- Data for Name: TimeEntry; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TimeEntry" VALUES ('cmo90nguj00jl8p8ctyflwxzw', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90k8my004w8p8c0cxnb7r1', '2026-03-10 20:27:56.682', '2026-03-10 20:27:56.682', 5, 92, 61, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:27:56.683', '2026-04-21 19:27:56.683', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nhcb00jn8p8c0juvcso8', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90k9gd00518p8c8rrckcit', '2026-03-11 20:27:57.323', '2026-03-11 20:27:57.323', 34, 47, 299, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:27:57.323', '2026-04-21 19:27:57.323', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nhwx00jp8p8chtrzhiin', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90ka4w00568p8cu8bk5jil', '2026-03-08 20:27:58.064', '2026-03-08 20:27:58.064', 57, 18, 423, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:27:58.065', '2026-04-21 19:27:58.065', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90niho00jr8p8cr05tcfdb', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90kaxk005b8p8cd7h6cyfw', '2026-03-16 20:27:58.811', '2026-03-16 20:27:58.811', 50, 73, 288, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:27:58.812', '2026-04-21 19:27:58.812', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nj2200jt8p8chot4nbyp', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90kbk1005g8p8clpwvzs3o', '2026-03-21 20:27:59.39', '2026-03-21 20:27:59.39', 15, 2, 516, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:27:59.391', '2026-04-21 19:27:59.391', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90njpz00jv8p8c6xq8w08b', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90kc7m005l8p8ckn55l25c', '2026-04-17 19:28:00.407', '2026-04-17 19:28:00.407', 35, 14, 60, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:00.408', '2026-04-21 19:28:00.408', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nkly00jx8p8crdvbdpng', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90kdcu005q8p8cdx12qt1h', '2026-03-28 20:28:01.558', '2026-03-28 20:28:01.558', 55, 73, 420, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:01.559', '2026-04-21 19:28:01.559', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nlau00jz8p8ctoxqbf2l', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90ke2e005v8p8cqwtt8zh4', '2026-03-11 20:28:02.454', '2026-03-11 20:28:02.454', 4, 61, 173, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:02.455', '2026-04-21 19:28:02.455', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nm6800k18p8cpyjwfw3w', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90kep200608p8c610vh2f8', '2026-03-08 20:28:03.583', '2026-03-08 20:28:03.583', 28, 101, 497, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:03.584', '2026-04-21 19:28:03.584', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nmvu00k38p8cfoc7okhg', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90kfml00658p8cnwdmv9bn', '2026-04-14 19:28:04.506', '2026-04-14 19:28:04.506', 10, 92, 446, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:04.507', '2026-04-21 19:28:04.507', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nnfs00k58p8cg3uk3hir', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kgb5006a8p8czsnfyxap', '2026-03-24 20:28:05.223', '2026-03-24 20:28:05.223', 27, 65, 273, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:05.224', '2026-04-21 19:28:05.224', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90no7y00k78p8c37l5tpb7', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90kgxr006f8p8clku99rwc', '2026-03-27 20:28:06.237', '2026-03-27 20:28:06.237', 2, 87, 210, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:06.238', '2026-04-21 19:28:06.238', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nolg00k98p8cli1q304f', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90ki4m006k8p8cmyexq0v3', '2026-04-09 19:28:06.723', '2026-04-09 19:28:06.723', 12, 45, 131, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:06.724', '2026-04-21 19:28:06.724', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90np6600kb8p8ckc28t3ll', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90kix4006p8p8cffe9dx7g', '2026-03-27 20:28:07.469', '2026-03-27 20:28:07.469', 11, 26, 417, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:07.47', '2026-04-21 19:28:07.47', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90npig00kd8p8c8ch562ts', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90kjxu006u8p8cxu00gd1h', '2026-03-22 20:28:07.912', '2026-03-22 20:28:07.912', 47, 29, 60, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:07.913', '2026-04-21 19:28:07.913', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90npwr00kf8p8cofd6euor', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90kl6e006z8p8czqhzt0a2', '2026-03-28 20:28:08.427', '2026-03-28 20:28:08.427', 33, 68, 373, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:08.428', '2026-04-21 19:28:08.428', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nq9b00kh8p8csvj345yk', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90km9h00748p8cp3mt8wjx', '2026-03-24 20:28:08.879', '2026-03-24 20:28:08.879', 8, 43, 206, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:08.88', '2026-04-21 19:28:08.88', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nqmu00kj8p8cbxcsycqt', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90knie00798p8czd71msbw', '2026-03-29 19:28:09.365', '2026-03-29 19:28:09.365', 56, 65, 133, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:09.366', '2026-04-21 19:28:09.366', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nqys00kl8p8ctjep3a0m', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90kvq2007e8p8cw7gn9lp4', '2026-03-21 20:28:09.795', '2026-03-21 20:28:09.795', 48, 114, 510, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:09.796', '2026-04-21 19:28:09.796', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nrcu00kn8p8cjsmkdxmv', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90kwfk007j8p8ck55jmyq0', '2026-03-19 20:28:10.301', '2026-03-19 20:28:10.301', 19, 91, 498, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:10.302', '2026-04-21 19:28:10.302', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nrqn00kp8p8cex05n7b1', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90kxj7007o8p8chjbw2p4k', '2026-04-07 19:28:10.799', '2026-04-07 19:28:10.799', 25, 25, 427, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:10.8', '2026-04-21 19:28:10.8', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ns2m00kr8p8cke3tfzpb', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90kyeh007t8p8cqxwpegs1', '2026-03-28 20:28:11.229', '2026-03-28 20:28:11.229', 27, 109, 528, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:11.23', '2026-04-21 19:28:11.23', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nsfh00kt8p8csb5unolk', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kzcl007y8p8cbh9pal4w', '2026-03-19 20:28:11.693', '2026-03-19 20:28:11.693', 32, 75, 516, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:11.694', '2026-04-21 19:28:11.694', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nsvq00kv8p8ctuutc7x8', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90l0e000838p8cyjny7n67', '2026-04-02 19:28:12.278', '2026-04-02 19:28:12.278', 34, 10, 480, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:12.278', '2026-04-21 19:28:12.278', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nt9700kx8p8chblk35xi', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90l1g100888p8cwiqokyp8', '2026-03-23 20:28:12.763', '2026-03-23 20:28:12.763', 4, 88, 69, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:12.764', '2026-04-21 19:28:12.764', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ntlp00kz8p8cg7uobjdi', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90l2ju008d8p8cb2wnhovh', '2026-03-09 20:28:13.212', '2026-03-09 20:28:13.212', 23, 37, 90, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:13.213', '2026-04-21 19:28:13.213', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ntyu00l18p8cikfo348z', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90l3fe008i8p8c34n6ducb', '2026-04-04 19:28:13.686', '2026-04-04 19:28:13.686', 37, 60, 385, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:13.687', '2026-04-21 19:28:13.687', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nuc500l38p8cgm9q7vd2', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90l4qk008n8p8c9flr9m6x', '2026-04-02 19:28:14.164', '2026-04-02 19:28:14.164', 41, 105, 108, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:14.165', '2026-04-21 19:28:14.165', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nusg00l58p8cqcm5eczu', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90l66c008s8p8cx4f5876z', '2026-03-25 20:28:14.65', '2026-03-25 20:28:14.65', 9, 33, 455, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:14.651', '2026-04-21 19:28:14.651', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nv4j00l78p8cdmgiqk2e', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90l6vk008x8p8c9lj26fte', '2026-03-27 20:28:15.187', '2026-03-27 20:28:15.187', 24, 49, 254, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:15.188', '2026-04-21 19:28:15.188', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nvi200l98p8chn15e288', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90l7mm00928p8cifi9uzxu', '2026-04-15 19:28:15.673', '2026-04-15 19:28:15.673', 6, 2, 146, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:15.674', '2026-04-21 19:28:15.674', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nvv700lb8p8ccekmfs8q', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90l8ax00978p8clt4go53n', '2026-03-20 20:28:16.146', '2026-03-20 20:28:16.146', 23, 113, 260, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:16.147', '2026-04-21 19:28:16.147', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nw8i00ld8p8cffu36jvk', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90l8ye009c8p8cq7l68evz', '2026-03-16 20:28:16.626', '2026-03-16 20:28:16.626', 18, 11, 361, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:16.626', '2026-04-21 19:28:16.626', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nwkb00lf8p8ct54qzb1x', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90l9m4009h8p8ce3wgs0hm', '2026-04-03 19:28:17.05', '2026-04-03 19:28:17.05', 54, 44, 127, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:17.051', '2026-04-21 19:28:17.051', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nwym00lh8p8cmjuczop3', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90laai009m8p8c8j2xoewu', '2026-03-16 20:28:17.565', '2026-03-16 20:28:17.565', 27, 53, 162, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:17.566', '2026-04-21 19:28:17.566', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nxrg00lj8p8c39s08f81', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90layd009r8p8cjhhq1xf5', '2026-04-15 19:28:18.604', '2026-04-15 19:28:18.604', 30, 107, 520, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:18.605', '2026-04-21 19:28:18.605', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nygo00ll8p8cghfhr8cr', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90lbn7009w8p8c5zaxogzg', '2026-04-21 19:28:19.511', '2026-04-21 19:28:19.511', 46, 106, 267, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:19.512', '2026-04-21 19:28:19.512', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nz3x00ln8p8cjjzk8sle', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90lcdm00a18p8cj9tytta0', '2026-03-28 20:28:20.348', '2026-03-28 20:28:20.348', 48, 1, 122, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:20.349', '2026-04-21 19:28:20.349', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90nzub00lp8p8c354a3817', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90ldcq00a68p8ctwyp2ox2', '2026-04-07 19:28:21.299', '2026-04-07 19:28:21.299', 29, 35, 100, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:21.3', '2026-04-21 19:28:21.3', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o0b400lr8p8ceo0lretv', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90le9300ab8p8c4ecu45da', '2026-03-14 20:28:21.904', '2026-03-14 20:28:21.904', 11, 42, 387, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:21.905', '2026-04-21 19:28:21.905', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o10j00lt8p8cl4jlgzv3', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90lf8k00ag8p8cmya6y89t', '2026-03-11 20:28:22.819', '2026-03-11 20:28:22.819', 46, 39, 258, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:22.82', '2026-04-21 19:28:22.82', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o1qr00lv8p8cmafi139t', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90lg5m00al8p8c11dhzco3', '2026-04-08 19:28:23.763', '2026-04-08 19:28:23.763', 32, 106, 118, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:23.764', '2026-04-21 19:28:23.764', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o2a200lx8p8c955t5xfh', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lhd600aq8p8crh0v4kya', '2026-04-21 19:28:24.458', '2026-04-21 19:28:24.458', 11, 81, 525, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:24.459', '2026-04-21 19:28:24.459', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o2wz00lz8p8cogyiymub', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90liu800av8p8cjk8e4qvx', '2026-03-21 20:28:25.282', '2026-03-21 20:28:25.282', 28, 43, 416, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:25.283', '2026-04-21 19:28:25.283', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o3gk00m18p8ccakly3f9', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90ljk300b08p8c8dshbbwa', '2026-04-09 19:28:25.987', '2026-04-09 19:28:25.987', 37, 43, 218, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:25.988', '2026-04-21 19:28:25.988', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o3s100m38p8c00a9nsi4', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90lkdc00b58p8c6we6ltkk', '2026-04-08 19:28:26.4', '2026-04-08 19:28:26.4', 56, 34, 530, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:26.401', '2026-04-21 19:28:26.401', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o44y00m58p8clxkj0st6', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90ll1m00ba8p8ccjmbo0wk', '2026-04-16 19:28:26.865', '2026-04-16 19:28:26.865', 60, 26, 67, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:26.866', '2026-04-21 19:28:26.866', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o4iz00m78p8cv5p5qih7', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90llnz00bf8p8c9wldo3xf', '2026-03-26 20:28:27.371', '2026-03-26 20:28:27.371', 32, 88, 422, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:27.372', '2026-04-21 19:28:27.372', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o4w600m98p8cc059utch', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90lmc000bk8p8chmy56adq', '2026-04-08 19:28:27.846', '2026-04-08 19:28:27.846', 56, 79, 253, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:27.846', '2026-04-21 19:28:27.846', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o58400mb8p8cpplm9cm0', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90lmzl00bp8p8cxnaqtmsb', '2026-03-13 20:28:28.275', '2026-03-13 20:28:28.275', 18, 56, 357, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:28.276', '2026-04-21 19:28:28.276', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o5mv00md8p8ch6k49hg8', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90k8my004w8p8c0cxnb7r1', '2026-04-15 19:28:28.806', '2026-04-15 19:28:28.806', 35, 69, 389, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:28.807', '2026-04-21 19:28:28.807', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o5zv00mf8p8cd7ovw6wd', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90k9gd00518p8c8rrckcit', '2026-03-16 20:28:29.274', '2026-03-16 20:28:29.274', 36, 14, 243, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:29.275', '2026-04-21 19:28:29.275', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o6c300mh8p8c5btdu9it', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90ka4w00568p8cu8bk5jil', '2026-03-14 20:28:29.714', '2026-03-14 20:28:29.714', 13, 110, 229, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:29.715', '2026-04-21 19:28:29.715', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o6si00mj8p8crtnrwjm1', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90kaxk005b8p8cd7h6cyfw', '2026-03-21 20:28:30.214', '2026-03-21 20:28:30.214', 47, 18, 414, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:30.215', '2026-04-21 19:28:30.215', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o75100ml8p8c9zlhbzx6', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90kbk1005g8p8clpwvzs3o', '2026-04-04 19:28:30.757', '2026-04-04 19:28:30.757', 56, 11, 320, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:30.758', '2026-04-21 19:28:30.758', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o7ic00mn8p8cd4wmp5fj', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90kc7m005l8p8ckn55l25c', '2026-04-20 19:28:31.235', '2026-04-20 19:28:31.235', 7, 4, 65, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:31.236', '2026-04-21 19:28:31.236', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o7u800mp8p8clsjy9ak8', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90kdcu005q8p8cdx12qt1h', '2026-03-09 20:28:31.664', '2026-03-09 20:28:31.664', 9, 86, 335, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:31.664', '2026-04-21 19:28:31.664', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o87x00mr8p8c9sdfjla0', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90ke2e005v8p8cqwtt8zh4', '2026-04-03 19:28:32.157', '2026-04-03 19:28:32.157', 49, 110, 359, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:32.158', '2026-04-21 19:28:32.158', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o8ll00mt8p8c4ea4hogq', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kep200608p8c610vh2f8', '2026-03-14 20:28:32.648', '2026-03-14 20:28:32.648', 36, 112, 492, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:32.649', '2026-04-21 19:28:32.649', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o8wl00mv8p8cc2iwuih8', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90kfml00658p8cnwdmv9bn', '2026-03-27 20:28:33.044', '2026-03-27 20:28:33.044', 2, 59, 445, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:33.045', '2026-04-21 19:28:33.045', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o98d00mx8p8cviju421e', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90kgb5006a8p8czsnfyxap', '2026-04-12 19:28:33.468', '2026-04-12 19:28:33.468', 3, 42, 425, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:33.469', '2026-04-21 19:28:33.469', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90o9px00mz8p8c4ujruopx', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90kgxr006f8p8clku99rwc', '2026-03-11 20:28:34.101', '2026-03-11 20:28:34.101', 38, 60, 526, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:34.102', '2026-04-21 19:28:34.102', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oa1y00n18p8ccw5zenyi', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90ki4m006k8p8cmyexq0v3', '2026-04-20 19:28:34.534', '2026-04-20 19:28:34.534', 36, 35, 487, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:34.535', '2026-04-21 19:28:34.535', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oadk00n38p8c29ggteci', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90kix4006p8p8cffe9dx7g', '2026-04-15 19:28:34.952', '2026-04-15 19:28:34.952', 47, 57, 539, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:34.953', '2026-04-21 19:28:34.953', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oasm00n58p8clrjp3mkd', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90kjxu006u8p8cxu00gd1h', '2026-04-15 19:28:35.494', '2026-04-15 19:28:35.494', 2, 86, 406, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:35.494', '2026-04-21 19:28:35.494', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ob5600n78p8cmgbj244g', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90kl6e006z8p8czqhzt0a2', '2026-03-14 20:28:35.946', '2026-03-14 20:28:35.946', 15, 105, 221, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:35.947', '2026-04-21 19:28:35.947', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90obir00n98p8csuy462vw', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90km9h00748p8cp3mt8wjx', '2026-04-12 19:28:36.435', '2026-04-12 19:28:36.435', 13, 36, 92, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:36.436', '2026-04-21 19:28:36.436', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90obv100nb8p8cgeqz6zna', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90knie00798p8czd71msbw', '2026-04-07 19:28:36.877', '2026-04-07 19:28:36.877', 32, 59, 70, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:36.878', '2026-04-21 19:28:36.878', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ocd300nd8p8cmdu388mg', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90kvq2007e8p8cw7gn9lp4', '2026-04-10 19:28:37.526', '2026-04-10 19:28:37.526', 60, 90, 296, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:37.527', '2026-04-21 19:28:37.527', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ocs800nf8p8c2e1gq2rc', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90kwfk007j8p8ck55jmyq0', '2026-04-10 19:28:38.071', '2026-04-10 19:28:38.071', 53, 54, 354, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:38.072', '2026-04-21 19:28:38.072', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90odax00nh8p8cy27o0fgp', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kxj7007o8p8chjbw2p4k', '2026-03-07 20:28:38.745', '2026-03-07 20:28:38.745', 9, 69, 285, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:38.746', '2026-04-21 19:28:38.746', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90odpl00nj8p8cg4wtclt2', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90kyeh007t8p8cqxwpegs1', '2026-03-16 20:28:39.272', '2026-03-16 20:28:39.272', 11, 104, 252, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:39.273', '2026-04-21 19:28:39.273', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oe7800nl8p8ciq29ms0s', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90kzcl007y8p8cbh9pal4w', '2026-03-15 20:28:39.908', '2026-03-15 20:28:39.908', 4, 103, 460, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:39.909', '2026-04-21 19:28:39.909', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oesl00nn8p8caz95wd7t', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90l0e000838p8cyjny7n67', '2026-03-24 20:28:40.676', '2026-03-24 20:28:40.676', 33, 44, 246, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:40.677', '2026-04-21 19:28:40.677', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90of8l00np8p8cnb6hoao3', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90l1g100888p8cwiqokyp8', '2026-03-30 19:28:41.252', '2026-03-30 19:28:41.252', 35, 113, 493, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:41.253', '2026-04-21 19:28:41.253', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ofve00nr8p8clrzykg24', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90l2ju008d8p8cb2wnhovh', '2026-04-12 19:28:42.074', '2026-04-12 19:28:42.074', 54, 3, 99, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:42.075', '2026-04-21 19:28:42.075', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ogdq00nt8p8c5vdfvrld', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90l3fe008i8p8c34n6ducb', '2026-03-25 20:28:42.734', '2026-03-25 20:28:42.734', 27, 102, 135, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:42.734', '2026-04-21 19:28:42.734', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oh7200nv8p8csz8bc2sp', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90l4qk008n8p8c9flr9m6x', '2026-03-15 20:28:43.79', '2026-03-15 20:28:43.79', 37, 101, 112, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:43.791', '2026-04-21 19:28:43.791', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ohol00nx8p8ctwquibxs', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90l66c008s8p8cx4f5876z', '2026-03-21 20:28:44.421', '2026-03-21 20:28:44.421', 47, 25, 457, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:44.422', '2026-04-21 19:28:44.422', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oi8m00nz8p8cw18ai1hi', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90l6vk008x8p8c9lj26fte', '2026-03-25 20:28:45.142', '2026-03-25 20:28:45.142', 19, 79, 60, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:45.143', '2026-04-21 19:28:45.143', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oipr00o18p8cirx8f9e3', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90l7mm00928p8cifi9uzxu', '2026-03-12 20:28:45.664', '2026-03-12 20:28:45.664', 60, 92, 192, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:45.665', '2026-04-21 19:28:45.665', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oj1e00o38p8c760vwlit', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90l8ax00978p8clt4go53n', '2026-04-07 19:28:46.177', '2026-04-07 19:28:46.177', 41, 87, 346, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:46.178', '2026-04-21 19:28:46.178', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ojg800o58p8c4apqxffl', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90l8ye009c8p8cq7l68evz', '2026-03-07 20:28:46.711', '2026-03-07 20:28:46.711', 51, 4, 465, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:46.712', '2026-04-21 19:28:46.712', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ojsw00o78p8cmlnrklyo', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90l9m4009h8p8ce3wgs0hm', '2026-03-15 20:28:47.167', '2026-03-15 20:28:47.167', 59, 120, 209, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:47.168', '2026-04-21 19:28:47.168', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ok6600o98p8ccpnspqlj', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90laai009m8p8c8j2xoewu', '2026-04-18 19:28:47.646', '2026-04-18 19:28:47.646', 55, 35, 189, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:47.647', '2026-04-21 19:28:47.647', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90okj600ob8p8c70rnw79x', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90layd009r8p8cjhhq1xf5', '2026-03-12 20:28:48.114', '2026-03-12 20:28:48.114', 28, 96, 188, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:48.115', '2026-04-21 19:28:48.115', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90okw700od8p8cs5ua4s44', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90lbn7009w8p8c5zaxogzg', '2026-03-29 19:28:48.582', '2026-03-29 19:28:48.582', 3, 34, 377, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:48.583', '2026-04-21 19:28:48.583', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ol9e00of8p8cbj240ndf', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90lcdm00a18p8cj9tytta0', '2026-03-08 20:28:49.057', '2026-03-08 20:28:49.057', 29, 82, 166, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:49.058', '2026-04-21 19:28:49.058', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90olku00oh8p8cdx8m5766', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90ldcq00a68p8ctwyp2ox2', '2026-03-16 20:28:49.469', '2026-03-16 20:28:49.469', 0, 9, 159, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:49.47', '2026-04-21 19:28:49.47', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90olzo00oj8p8cbabuqfcf', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90le9300ab8p8c4ecu45da', '2026-03-25 20:28:50.003', '2026-03-25 20:28:50.003', 0, 68, 209, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:50.004', '2026-04-21 19:28:50.004', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90omc000ol8p8c81klqma4', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lf8k00ag8p8cmya6y89t', '2026-03-09 20:28:50.447', '2026-03-09 20:28:50.447', 41, 83, 368, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:50.448', '2026-04-21 19:28:50.448', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90omnf00on8p8cu66apdc5', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90lg5m00al8p8c11dhzco3', '2026-03-15 20:28:50.859', '2026-03-15 20:28:50.859', 35, 17, 354, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:50.86', '2026-04-21 19:28:50.86', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90omzm00op8p8c0tr2r1ow', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90lhd600aq8p8crh0v4kya', '2026-04-03 19:28:51.297', '2026-04-03 19:28:51.297', 11, 44, 286, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:51.298', '2026-04-21 19:28:51.298', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90onga00or8p8cmftowr69', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90liu800av8p8cjk8e4qvx', '2026-03-13 20:28:51.897', '2026-03-13 20:28:51.897', 7, 13, 180, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:51.898', '2026-04-21 19:28:51.898', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ont600ot8p8ch18vsdyd', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90ljk300b08p8c8dshbbwa', '2026-03-23 20:28:52.362', '2026-03-23 20:28:52.362', 46, 42, 166, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:52.363', '2026-04-21 19:28:52.363', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oo5e00ov8p8cpybmyj2i', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90lkdc00b58p8c6we6ltkk', '2026-04-04 19:28:52.801', '2026-04-04 19:28:52.801', 9, 101, 148, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:52.802', '2026-04-21 19:28:52.802', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ooj000ox8p8cv5bdii91', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90ll1m00ba8p8ccjmbo0wk', '2026-03-09 20:28:53.291', '2026-03-09 20:28:53.291', 27, 85, 97, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:53.292', '2026-04-21 19:28:53.292', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oowm00oz8p8cq24s1wg1', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90llnz00bf8p8c9wldo3xf', '2026-03-25 20:28:53.782', '2026-03-25 20:28:53.782', 59, 28, 308, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:53.783', '2026-04-21 19:28:53.783', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90op9g00p18p8c7jb9j0y8', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90lmc000bk8p8chmy56adq', '2026-04-15 19:28:54.244', '2026-04-15 19:28:54.244', 37, 23, 108, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:54.245', '2026-04-21 19:28:54.245', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oplc00p38p8cr5z8n3pt', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90lmzl00bp8p8cxnaqtmsb', '2026-03-19 20:28:54.671', '2026-03-19 20:28:54.671', 2, 42, 484, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:54.672', '2026-04-21 19:28:54.672', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90opyr00p58p8c3r7ci569', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90k8my004w8p8c0cxnb7r1', '2026-03-14 20:28:55.155', '2026-03-14 20:28:55.155', 57, 11, 462, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:55.156', '2026-04-21 19:28:55.156', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oqc300p78p8cxhb8k0kz', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90k9gd00518p8c8rrckcit', '2026-03-24 20:28:55.634', '2026-03-24 20:28:55.634', 59, 86, 189, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:55.635', '2026-04-21 19:28:55.635', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oqnr00p98p8cxdukb9v3', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90ka4w00568p8cu8bk5jil', '2026-04-17 19:28:56.054', '2026-04-17 19:28:56.054', 11, 89, 180, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:56.055', '2026-04-21 19:28:56.055', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90or2300pb8p8ctz850rzi', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90kaxk005b8p8cd7h6cyfw', '2026-03-13 20:28:56.571', '2026-03-13 20:28:56.571', 2, 113, 417, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:56.572', '2026-04-21 19:28:56.572', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90orev00pd8p8ckyts8u1w', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90kbk1005g8p8clpwvzs3o', '2026-04-05 19:28:57.031', '2026-04-05 19:28:57.031', 24, 11, 386, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:57.032', '2026-04-21 19:28:57.032', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90os1m00pf8p8cez845ynw', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90kc7m005l8p8ckn55l25c', '2026-04-14 19:28:57.85', '2026-04-14 19:28:57.85', 28, 21, 132, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:57.851', '2026-04-21 19:28:57.851', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90osje00ph8p8capsxzf0a', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kdcu005q8p8cdx12qt1h', '2026-03-09 20:28:58.489', '2026-03-09 20:28:58.489', 22, 72, 268, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:58.49', '2026-04-21 19:28:58.49', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ot4l00pj8p8c06s0istz', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90ke2e005v8p8cqwtt8zh4', '2026-03-14 20:28:59.252', '2026-03-14 20:28:59.252', 3, 45, 434, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:28:59.253', '2026-04-21 19:28:59.253', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90otkd00pl8p8c98ptj2el', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90kep200608p8c610vh2f8', '2026-03-18 20:28:59.82', '2026-03-18 20:28:59.82', 48, 116, 491, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:28:59.821', '2026-04-21 19:28:59.821', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90otzt00pn8p8ckkxzr3vm', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90kfml00658p8cnwdmv9bn', '2026-04-21 19:29:00.377', '2026-04-21 19:29:00.377', 47, 52, 222, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:00.378', '2026-04-21 19:29:00.378', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oulw00pp8p8cxx1a6cja', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90kgb5006a8p8czsnfyxap', '2026-04-10 19:29:01.098', '2026-04-10 19:29:01.098', 39, 23, 404, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:01.099', '2026-04-21 19:29:01.099', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ov3v00pr8p8c1u9vxcpp', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90kgxr006f8p8clku99rwc', '2026-04-21 19:29:01.819', '2026-04-21 19:29:01.819', 26, 79, 117, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:01.82', '2026-04-21 19:29:01.82', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ovvc00pt8p8c2j6840gl', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90ki4m006k8p8cmyexq0v3', '2026-03-12 20:29:02.807', '2026-03-12 20:29:02.807', 19, 55, 281, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:02.808', '2026-04-21 19:29:02.808', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90owdo00pv8p8czmrpl5fy', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90kix4006p8p8cffe9dx7g', '2026-03-30 19:29:03.468', '2026-03-30 19:29:03.468', 35, 96, 492, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:03.469', '2026-04-21 19:29:03.469', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ox3x00px8p8cfezyzelw', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90kjxu006u8p8cxu00gd1h', '2026-04-10 19:29:04.413', '2026-04-10 19:29:04.413', 27, 107, 99, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:04.414', '2026-04-21 19:29:04.414', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oxl000pz8p8czbz9q8bb', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90kl6e006z8p8czqhzt0a2', '2026-03-09 20:29:05.027', '2026-03-09 20:29:05.027', 22, 46, 244, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:05.028', '2026-04-21 19:29:05.028', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oy4400q18p8ciby2t0ww', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90km9h00748p8cp3mt8wjx', '2026-04-13 19:29:05.715', '2026-04-13 19:29:05.715', 26, 84, 369, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:05.716', '2026-04-21 19:29:05.716', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oyhe00q38p8cyqjn2lia', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90knie00798p8czd71msbw', '2026-04-02 19:29:06.194', '2026-04-02 19:29:06.194', 18, 16, 168, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:06.195', '2026-04-21 19:29:06.195', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oysr00q58p8ca1ozy8pm', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kvq2007e8p8cw7gn9lp4', '2026-03-13 20:29:06.603', '2026-03-13 20:29:06.603', 59, 5, 385, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:06.604', '2026-04-21 19:29:06.604', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90oz7e00q78p8c9jxuaf8j', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90kwfk007j8p8ck55jmyq0', '2026-04-02 19:29:07.13', '2026-04-02 19:29:07.13', 27, 108, 99, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:07.131', '2026-04-21 19:29:07.131', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ozk900q98p8c79diupwn', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90kxj7007o8p8chjbw2p4k', '2026-03-27 20:29:07.593', '2026-03-27 20:29:07.593', 8, 116, 156, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:07.594', '2026-04-21 19:29:07.594', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ozy200qb8p8c0jiu927p', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90kyeh007t8p8cqxwpegs1', '2026-03-19 20:29:08.09', '2026-03-19 20:29:08.09', 18, 90, 273, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:08.091', '2026-04-21 19:29:08.091', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p0a000qd8p8c0jv7fraw', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90kzcl007y8p8cbh9pal4w', '2026-04-05 19:29:08.52', '2026-04-05 19:29:08.52', 10, 53, 130, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:08.521', '2026-04-21 19:29:08.521', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p0ts00qf8p8cewwzbqdv', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90l0e000838p8cyjny7n67', '2026-03-13 20:29:09.231', '2026-03-13 20:29:09.231', 33, 50, 280, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:09.232', '2026-04-21 19:29:09.232', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p16a00qh8p8ctuq6hvtm', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90l1g100888p8cwiqokyp8', '2026-04-01 19:29:09.681', '2026-04-01 19:29:09.681', 18, 88, 204, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:09.682', '2026-04-21 19:29:09.682', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p1jw00qj8p8cbvfl416n', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90l2ju008d8p8cb2wnhovh', '2026-03-09 20:29:10.171', '2026-03-09 20:29:10.171', 18, 3, 434, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:10.172', '2026-04-21 19:29:10.172', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p1wp00ql8p8coctcts9n', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90l3fe008i8p8c34n6ducb', '2026-03-31 19:29:10.633', '2026-03-31 19:29:10.633', 5, 51, 512, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:10.633', '2026-04-21 19:29:10.633', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p29u00qn8p8cp38pfae5', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90l4qk008n8p8c9flr9m6x', '2026-03-10 20:29:11.106', '2026-03-10 20:29:11.106', 9, 65, 150, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:11.107', '2026-04-21 19:29:11.107', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p2mo00qp8p8c700dlogv', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90l66c008s8p8cx4f5876z', '2026-04-10 19:29:11.568', '2026-04-10 19:29:11.568', 58, 67, 409, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:11.568', '2026-04-21 19:29:11.568', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p30100qr8p8cj2lrjlj0', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90l6vk008x8p8c9lj26fte', '2026-04-04 19:29:12.048', '2026-04-04 19:29:12.048', 59, 8, 383, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:12.049', '2026-04-21 19:29:12.049', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p3cq00qt8p8ckq0cbmby', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90l7mm00928p8cifi9uzxu', '2026-03-12 20:29:12.506', '2026-03-12 20:29:12.506', 14, 21, 203, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:12.507', '2026-04-21 19:29:12.507', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p3qd00qv8p8cnqe1qrr6', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90l8ax00978p8clt4go53n', '2026-03-19 20:29:12.996', '2026-03-19 20:29:12.996', 48, 48, 243, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:12.997', '2026-04-21 19:29:12.997', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p43400qx8p8cbe51e5go', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90l8ye009c8p8cq7l68evz', '2026-04-02 19:29:13.456', '2026-04-02 19:29:13.456', 9, 26, 129, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:13.457', '2026-04-21 19:29:13.457', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p4fq00qz8p8c0gq4hkdu', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90l9m4009h8p8ce3wgs0hm', '2026-03-27 20:29:13.909', '2026-03-27 20:29:13.909', 2, 74, 509, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:13.91', '2026-04-21 19:29:13.91', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p4sh00r18p8cll190744', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90laai009m8p8c8j2xoewu', '2026-04-21 19:29:14.369', '2026-04-21 19:29:14.369', 38, 53, 321, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:14.37', '2026-04-21 19:29:14.37', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p58q00r38p8co28o1zut', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90layd009r8p8cjhhq1xf5', '2026-03-10 20:29:14.953', '2026-03-10 20:29:14.953', 37, 69, 455, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:14.954', '2026-04-21 19:29:14.954', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p5lt00r58p8c9psmovu0', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90lbn7009w8p8c5zaxogzg', '2026-04-16 19:29:15.424', '2026-04-16 19:29:15.424', 35, 100, 172, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:15.425', '2026-04-21 19:29:15.425', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p5xw00r78p8c7e6l1ypj', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90lcdm00a18p8cj9tytta0', '2026-03-15 20:29:15.859', '2026-03-15 20:29:15.859', 48, 55, 337, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:15.86', '2026-04-21 19:29:15.86', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p6ey00r98p8c3lonh4hj', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90ldcq00a68p8ctwyp2ox2', '2026-03-19 20:29:16.379', '2026-03-19 20:29:16.379', 4, 51, 151, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:16.38', '2026-04-21 19:29:16.38', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p6rg00rb8p8cabpjasma', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90le9300ab8p8c4ecu45da', '2026-04-07 19:29:16.924', '2026-04-07 19:29:16.924', 21, 104, 404, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:16.925', '2026-04-21 19:29:16.925', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p7fy00rd8p8cjtfgeuen', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90lf8k00ag8p8cmya6y89t', '2026-03-07 20:29:17.805', '2026-03-07 20:29:17.805', 20, 50, 158, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:17.806', '2026-04-21 19:29:17.806', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p7wa00rf8p8cv4pn6gtp', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90lg5m00al8p8c11dhzco3', '2026-04-16 19:29:18.394', '2026-04-16 19:29:18.394', 51, 101, 82, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:18.395', '2026-04-21 19:29:18.395', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p8ds00rh8p8csj61htd5', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90lhd600aq8p8crh0v4kya', '2026-04-08 19:29:19.023', '2026-04-08 19:29:19.023', 38, 67, 131, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:19.024', '2026-04-21 19:29:19.024', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p8t800rj8p8cuiamsnej', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90liu800av8p8cjk8e4qvx', '2026-04-17 19:29:19.579', '2026-04-17 19:29:19.579', 57, 32, 90, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:19.58', '2026-04-21 19:29:19.58', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p9az00rl8p8c7etqvdnh', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90ljk300b08p8c8dshbbwa', '2026-03-13 20:29:20.219', '2026-03-13 20:29:20.219', 41, 89, 66, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:20.219', '2026-04-21 19:29:20.219', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90p9qs00rn8p8c4ogi5t43', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90lkdc00b58p8c6we6ltkk', '2026-04-14 19:29:20.788', '2026-04-14 19:29:20.788', 36, 103, 455, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:20.789', '2026-04-21 19:29:20.789', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pa8o00rp8p8cgsbrl5na', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90ll1m00ba8p8ccjmbo0wk', '2026-04-04 19:29:21.432', '2026-04-04 19:29:21.432', 33, 22, 520, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:21.433', '2026-04-21 19:29:21.433', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pavl00rr8p8cyhbdqv5v', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90llnz00bf8p8c9wldo3xf', '2026-04-09 19:29:22.257', '2026-04-09 19:29:22.257', 14, 8, 223, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:22.257', '2026-04-21 19:29:22.257', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pbdq00rt8p8c2mxnnmb5', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90lmc000bk8p8chmy56adq', '2026-04-02 19:29:22.91', '2026-04-02 19:29:22.91', 5, 8, 105, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:22.911', '2026-04-21 19:29:22.911', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pcb400rv8p8c5y8gmt6m', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90lmzl00bp8p8cxnaqtmsb', '2026-04-02 19:29:24.112', '2026-04-02 19:29:24.112', 36, 97, 498, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:24.113', '2026-04-21 19:29:24.113', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pcxm00rx8p8c6mpzmmtu', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90k8my004w8p8c0cxnb7r1', '2026-04-02 19:29:24.922', '2026-04-02 19:29:24.922', 36, 21, 299, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:24.923', '2026-04-21 19:29:24.923', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pdcf00rz8p8cjvjo8rlx', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90k9gd00518p8c8rrckcit', '2026-03-15 20:29:25.455', '2026-03-15 20:29:25.455', 7, 3, 261, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:25.455', '2026-04-21 19:29:25.455', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pdue00s18p8cs9bnxbct', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90ka4w00568p8cu8bk5jil', '2026-04-17 19:29:26.101', '2026-04-17 19:29:26.101', 38, 23, 122, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:26.102', '2026-04-21 19:29:26.102', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pe7e00s38p8c6zggf2ya', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90kaxk005b8p8cd7h6cyfw', '2026-04-08 19:29:26.57', '2026-04-08 19:29:26.57', 2, 9, 95, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:26.571', '2026-04-21 19:29:26.571', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pekg00s58p8cbpodmom3', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90kbk1005g8p8clpwvzs3o', '2026-03-13 20:29:27.04', '2026-03-13 20:29:27.04', 36, 26, 349, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:27.041', '2026-04-21 19:29:27.041', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pexo00s78p8c5h9llvl0', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90kc7m005l8p8ckn55l25c', '2026-03-08 20:29:27.515', '2026-03-08 20:29:27.515', 20, 101, 351, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:27.516', '2026-04-21 19:29:27.516', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pfal00s98p8cjsu66r50', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90kdcu005q8p8cdx12qt1h', '2026-04-17 19:29:27.981', '2026-04-17 19:29:27.981', 34, 12, 149, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:27.981', '2026-04-21 19:29:27.981', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pfn200sb8p8c961qtha8', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90ke2e005v8p8cqwtt8zh4', '2026-04-19 19:29:28.429', '2026-04-19 19:29:28.429', 59, 78, 128, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:28.43', '2026-04-21 19:29:28.43', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pg1h00sd8p8cp3wxhq0a', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90kep200608p8c610vh2f8', '2026-03-25 20:29:28.949', '2026-03-25 20:29:28.949', 27, 58, 312, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:28.95', '2026-04-21 19:29:28.95', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pgeu00sf8p8cdyylxf4o', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90kfml00658p8cnwdmv9bn', '2026-03-18 20:29:29.43', '2026-03-18 20:29:29.43', 31, 78, 210, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:29.43', '2026-04-21 19:29:29.43', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pgu200sh8p8cftbqhb34', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90kgb5006a8p8czsnfyxap', '2026-04-02 19:29:29.978', '2026-04-02 19:29:29.978', 45, 91, 450, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:29.979', '2026-04-21 19:29:29.979', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ph6y00sj8p8cbfyck7db', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90kgxr006f8p8clku99rwc', '2026-03-29 19:29:30.442', '2026-03-29 19:29:30.442', 41, 114, 314, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:30.442', '2026-04-21 19:29:30.442', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90phjy00sl8p8c0mev52b6', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90ki4m006k8p8cmyexq0v3', '2026-04-13 19:29:30.91', '2026-04-13 19:29:30.91', 38, 45, 332, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:30.91', '2026-04-21 19:29:30.91', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90phxx00sn8p8chc0htm2c', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90kix4006p8p8cffe9dx7g', '2026-03-27 20:29:31.412', '2026-03-27 20:29:31.412', 21, 107, 458, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:31.413', '2026-04-21 19:29:31.413', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90picz00sp8p8clvsvncmq', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90kjxu006u8p8cxu00gd1h', '2026-03-29 19:29:31.866', '2026-03-29 19:29:31.866', 47, 8, 509, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:31.866', '2026-04-21 19:29:31.866', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pip600sr8p8c9etallcv', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90kl6e006z8p8czqhzt0a2', '2026-04-20 19:29:32.393', '2026-04-20 19:29:32.393', 60, 75, 150, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:32.394', '2026-04-21 19:29:32.394', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pj2200st8p8cd1gaor63', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90km9h00748p8cp3mt8wjx', '2026-03-28 20:29:32.857', '2026-03-28 20:29:32.857', 22, 26, 388, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:32.858', '2026-04-21 19:29:32.858', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pjfl00sv8p8c5giu4g8g', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90knie00798p8czd71msbw', '2026-04-07 19:29:33.344', '2026-04-07 19:29:33.344', 47, 46, 326, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:33.345', '2026-04-21 19:29:33.345', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pju100sx8p8cse5w7l0z', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90kvq2007e8p8cw7gn9lp4', '2026-04-16 19:29:33.864', '2026-04-16 19:29:33.864', 16, 84, 483, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:33.865', '2026-04-21 19:29:33.865', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pk6400sz8p8ca4kmd6k5', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90kwfk007j8p8ck55jmyq0', '2026-04-03 19:29:34.3', '2026-04-03 19:29:34.3', 47, 107, 223, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:34.301', '2026-04-21 19:29:34.301', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pkit00t18p8cvx1w2hf7', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90kxj7007o8p8chjbw2p4k', '2026-03-14 20:29:34.757', '2026-03-14 20:29:34.757', 5, 51, 404, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:34.758', '2026-04-21 19:29:34.758', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pkyo00t38p8c8nldp1bh', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90kyeh007t8p8cqxwpegs1', '2026-03-16 20:29:35.327', '2026-03-16 20:29:35.327', 9, 9, 268, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:35.328', '2026-04-21 19:29:35.328', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90plc200t58p8ceumd1gjf', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90kzcl007y8p8cbh9pal4w', '2026-04-08 19:29:35.81', '2026-04-08 19:29:35.81', 9, 31, 486, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:35.811', '2026-04-21 19:29:35.811', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90plo600t78p8cym36r78h', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90l0e000838p8cyjny7n67', '2026-04-21 19:29:36.245', '2026-04-21 19:29:36.245', 7, 34, 400, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:36.247', '2026-04-21 19:29:36.247', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pm2100t98p8cq2a46n42', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90l1g100888p8cwiqokyp8', '2026-03-17 20:29:36.745', '2026-03-17 20:29:36.745', 56, 105, 169, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:36.746', '2026-04-21 19:29:36.746', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pmjh00tb8p8cn5cv65p7', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90l2ju008d8p8cb2wnhovh', '2026-04-14 19:29:37.372', '2026-04-14 19:29:37.372', 2, 69, 281, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:37.373', '2026-04-21 19:29:37.373', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pmzg00td8p8cmiq3m4n6', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90l3fe008i8p8c34n6ducb', '2026-03-30 19:29:37.948', '2026-03-30 19:29:37.948', 5, 57, 256, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:37.949', '2026-04-21 19:29:37.949', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pnfl00tf8p8ctemta2gy', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90l4qk008n8p8c9flr9m6x', '2026-03-13 20:29:38.528', '2026-03-13 20:29:38.528', 16, 96, 321, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:38.529', '2026-04-21 19:29:38.529', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90po1z00th8p8cpzilwge4', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90l66c008s8p8cx4f5876z', '2026-03-13 20:29:39.335', '2026-03-13 20:29:39.335', 23, 74, 188, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:39.336', '2026-04-21 19:29:39.336', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90poio00tj8p8cawo5w6g5', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90l6vk008x8p8c9lj26fte', '2026-03-12 20:29:39.936', '2026-03-12 20:29:39.936', 2, 78, 78, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:39.937', '2026-04-21 19:29:39.937', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pp4500tl8p8ci24mx20d', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90l7mm00928p8cifi9uzxu', '2026-03-23 20:29:40.708', '2026-03-23 20:29:40.708', 30, 1, 468, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:40.709', '2026-04-21 19:29:40.709', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90ppk100tn8p8cs7gibcag', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90l8ax00978p8clt4go53n', '2026-04-12 19:29:41.281', '2026-04-12 19:29:41.281', 38, 44, 200, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:41.282', '2026-04-21 19:29:41.282', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pq2n00tp8p8cpj7winz1', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90l8ye009c8p8cq7l68evz', '2026-04-16 19:29:41.95', '2026-04-16 19:29:41.95', 32, 84, 532, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:41.951', '2026-04-21 19:29:41.951', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pqq400tr8p8c6mkv5m6p', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90l9m4009h8p8ce3wgs0hm', '2026-03-16 20:29:42.796', '2026-03-16 20:29:42.796', 43, 70, 474, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:42.796', '2026-04-21 19:29:42.796', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pr7i00tt8p8c4owzt0p9', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90laai009m8p8c8j2xoewu', '2026-03-11 20:29:43.421', '2026-03-11 20:29:43.421', 29, 77, 537, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:43.422', '2026-04-21 19:29:43.422', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90prop00tv8p8co9kch5jl', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90layd009r8p8cjhhq1xf5', '2026-03-14 20:29:44.041', '2026-03-14 20:29:44.041', 55, 79, 333, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:44.042', '2026-04-21 19:29:44.042', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90psbr00tx8p8cid11srek', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lbn7009w8p8c5zaxogzg', '2026-03-22 20:29:44.871', '2026-03-22 20:29:44.871', 31, 82, 242, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:44.872', '2026-04-21 19:29:44.872', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90psr300tz8p8c06s3mjxv', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90lcdm00a18p8cj9tytta0', '2026-04-15 19:29:45.422', '2026-04-15 19:29:45.422', 49, 114, 136, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:45.423', '2026-04-21 19:29:45.423', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pt4600u18p8comn4jhtc', 'cmo90ja3800298p8cqphzc1hi', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90ldcq00a68p8ctwyp2ox2', '2026-04-15 19:29:45.894', '2026-04-15 19:29:45.894', 21, 30, 396, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:45.895', '2026-04-21 19:29:45.895', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pthb00u38p8c0r63jtzm', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90le9300ab8p8c4ecu45da', '2026-03-22 20:29:46.367', '2026-03-22 20:29:46.367', 54, 110, 105, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:46.368', '2026-04-21 19:29:46.368', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pttm00u58p8c9kc6tilh', 'cmo90je36002c8p8c86e5snpa', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90lf8k00ag8p8cmya6y89t', '2026-03-28 20:29:46.809', '2026-03-28 20:29:46.809', 10, 90, 326, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:46.81', '2026-04-21 19:29:46.81', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90puaa00u78p8cf9o044h9', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k66y004r8p8c51np3e4s', 'cmo90lg5m00al8p8c11dhzco3', '2026-03-21 20:29:47.333', '2026-03-21 20:29:47.333', 57, 79, 281, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:47.334', '2026-04-21 19:29:47.334', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90puo300u98p8czaspx8k3', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jru300388p8c1ire5mdf', 'cmo90lhd600aq8p8crh0v4kya', '2026-03-11 20:29:47.907', '2026-03-11 20:29:47.907', 57, 0, 480, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:47.908', '2026-04-21 19:29:47.908', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pv0d00ub8p8cp5yngjqj', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90liu800av8p8cjk8e4qvx', '2026-04-03 19:29:48.349', '2026-04-03 19:29:48.349', 13, 32, 247, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:48.349', '2026-04-21 19:29:48.349', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pvci00ud8p8cn9mp55kc', 'cmo90je36002c8p8c86e5snpa', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90ljk300b08p8c8dshbbwa', '2026-04-13 19:29:48.785', '2026-04-13 19:29:48.785', 23, 105, 519, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:48.786', '2026-04-21 19:29:48.786', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pvrn00uf8p8cmw9smdgd', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jum2003n8p8crdn2hbox', 'cmo90lkdc00b58p8c6we6ltkk', '2026-04-04 19:29:49.33', '2026-04-04 19:29:49.33', 56, 41, 527, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:49.331', '2026-04-21 19:29:49.331', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pw4g00uh8p8cn01ndcqg', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90ll1m00ba8p8ccjmbo0wk', '2026-03-11 20:29:49.791', '2026-03-11 20:29:49.791', 36, 95, 372, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:49.792', '2026-04-21 19:29:49.792', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pwxu00uj8p8c4vv6to09', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90llnz00bf8p8c9wldo3xf', '2026-04-05 19:29:50.849', '2026-04-05 19:29:50.849', 42, 76, 82, 'Pontaj teren', 'DRAFT', NULL, NULL, NULL, NULL, '2026-04-21 19:29:50.85', '2026-04-21 19:29:50.85', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pxdr00ul8p8cw8lfryyd', 'cmo90je36002c8p8c86e5snpa', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90lmc000bk8p8chmy56adq', '2026-03-27 20:29:51.423', '2026-03-27 20:29:51.423', 32, 41, 509, 'Pontaj teren', 'SUBMITTED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:51.424', '2026-04-21 19:29:51.424', 'STOPPED', 0, NULL);
INSERT INTO public."TimeEntry" VALUES ('cmo90pxu500un8p8cwitvsie0', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90k1in00478p8cxmksb7pr', 'cmo90lmzl00bp8p8cxnaqtmsb', '2026-03-13 20:29:52.013', '2026-03-13 20:29:52.013', 55, 91, 360, 'Pontaj teren', 'APPROVED', NULL, NULL, NULL, NULL, '2026-04-21 19:29:52.014', '2026-04-21 19:29:52.014', 'STOPPED', 0, NULL);


--
-- Data for Name: WorkOrder; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."WorkOrder" VALUES ('cmo90k8my004w8p8c0cxnb7r1', 'cmo90jru300388p8c1ire5mdf', 'cmo90jru300398p8cdtpm4zh7', 'Lucrare #1 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-09 19:25:26.074', '2026-04-24 19:25:26.074', 36.00, 1.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:26.075', '2026-04-21 19:25:26.075');
INSERT INTO public."WorkOrder" VALUES ('cmo90k9gd00518p8c8rrckcit', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90jru3003b8p8cal8wm4vo', 'Lucrare #2 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-15 19:25:27.133', '2026-05-07 19:25:27.133', 16.00, 22.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:27.134', '2026-04-21 19:25:27.134');
INSERT INTO public."WorkOrder" VALUES ('cmo90ka4w00568p8cu8bk5jil', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90jsuh003f8p8ctmlbcse3', 'Lucrare #3 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-16 19:25:28.016', '2026-05-11 19:25:28.016', 22.00, 5.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:28.017', '2026-04-21 19:25:28.017');
INSERT INTO public."WorkOrder" VALUES ('cmo90kaxk005b8p8cd7h6cyfw', 'cmo90jum2003n8p8crdn2hbox', 'cmo90jtqk003j8p8czr687t4d', 'Lucrare #4 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-08 19:25:29.048', '2026-05-10 19:25:29.048', 25.00, 21.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:29.048', '2026-04-21 19:25:29.048');
INSERT INTO public."WorkOrder" VALUES ('cmo90kbk1005g8p8clpwvzs3o', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90jtqk003l8p8cigcnrx1q', 'Lucrare #5 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-15 19:25:29.857', '2026-05-02 19:25:29.857', 35.00, 17.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:29.858', '2026-04-21 19:25:29.858');
INSERT INTO public."WorkOrder" VALUES ('cmo90kc7m005l8p8ckn55l25c', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90jum2003p8p8cigwqe0ga', 'Lucrare #6 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-15 19:25:30.706', '2026-05-11 19:25:30.706', 6.00, 12.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:30.707', '2026-04-21 19:25:30.707');
INSERT INTO public."WorkOrder" VALUES ('cmo90kdcu005q8p8cdx12qt1h', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90jvhh003t8p8cjgzffx0r', 'Lucrare #7 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-15 19:25:32.109', '2026-05-04 19:25:32.109', 12.00, 21.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:32.11', '2026-04-21 19:25:32.11');
INSERT INTO public."WorkOrder" VALUES ('cmo90ke2e005v8p8cqwtt8zh4', 'cmo90k1in00478p8cxmksb7pr', 'cmo90jvhh003v8p8camgfl6yn', 'Lucrare #8 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-18 19:25:33.109', '2026-05-06 19:25:33.109', 18.00, 35.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:33.11', '2026-04-21 19:25:33.11');
INSERT INTO public."WorkOrder" VALUES ('cmo90kep200608p8c610vh2f8', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90jw9o003z8p8cwr0xfahh', 'Lucrare #9 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-17 19:25:33.926', '2026-05-03 19:25:33.926', 29.00, 31.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:33.926', '2026-04-21 19:25:33.926');
INSERT INTO public."WorkOrder" VALUES ('cmo90kfml00658p8cnwdmv9bn', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90jyvq00438p8ct8iir6n3', 'Lucrare #10 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-10 19:25:35.132', '2026-05-10 19:25:35.132', 39.00, 7.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:35.133', '2026-04-21 19:25:35.133');
INSERT INTO public."WorkOrder" VALUES ('cmo90kgb5006a8p8czsnfyxap', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90jyvq00458p8c43hfg0il', 'Lucrare #11 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-07 19:25:36.016', '2026-05-09 19:25:36.016', 13.00, 23.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:36.017', '2026-04-21 19:25:36.017');
INSERT INTO public."WorkOrder" VALUES ('cmo90kgxr006f8p8clku99rwc', 'cmo90k66y004r8p8c51np3e4s', 'cmo90k1in00498p8crejm4fdp', 'Lucrare #12 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-14 19:25:36.831', '2026-05-08 19:25:36.831', 31.00, 35.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:36.832', '2026-04-21 19:25:36.832');
INSERT INTO public."WorkOrder" VALUES ('cmo90ki4m006k8p8cmyexq0v3', 'cmo90jru300388p8c1ire5mdf', 'cmo90k2n4004d8p8c643kczkb', 'Lucrare #13 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-20 19:25:38.374', '2026-05-02 19:25:38.374', 21.00, 5.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:38.375', '2026-04-21 19:25:38.375');
INSERT INTO public."WorkOrder" VALUES ('cmo90kix4006p8p8cffe9dx7g', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90k2n4004f8p8cu3wj5nsq', 'Lucrare #14 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-18 19:25:39.4', '2026-04-28 19:25:39.4', 20.00, 8.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:39.401', '2026-04-21 19:25:39.401');
INSERT INTO public."WorkOrder" VALUES ('cmo90kjxu006u8p8cxu00gd1h', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90k3s1004j8p8cuh6pe19j', 'Lucrare #15 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-20 19:25:40.721', '2026-05-11 19:25:40.721', 29.00, 32.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:40.722', '2026-04-21 19:25:40.722');
INSERT INTO public."WorkOrder" VALUES ('cmo90kl6e006z8p8czqhzt0a2', 'cmo90jum2003n8p8crdn2hbox', 'cmo90k4ve004n8p8c81nvtb5i', 'Lucrare #16 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-14 19:25:42.326', '2026-04-30 19:25:42.326', 12.00, 15.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:42.326', '2026-04-21 19:25:42.326');
INSERT INTO public."WorkOrder" VALUES ('cmo90km9h00748p8cp3mt8wjx', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90k4ve004p8p8chd3eh8c8', 'Lucrare #17 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-19 19:25:43.733', '2026-04-27 19:25:43.733', 30.00, 27.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:43.734', '2026-04-21 19:25:43.734');
INSERT INTO public."WorkOrder" VALUES ('cmo90kvq2007e8p8cw7gn9lp4', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90jru300398p8cdtpm4zh7', 'Lucrare #19 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-08 19:25:51.768', '2026-05-10 19:25:51.768', 15.00, 13.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:25:51.769', '2026-04-21 19:25:51.769');
INSERT INTO public."WorkOrder" VALUES ('cmo90kwfk007j8p8ck55jmyq0', 'cmo90k1in00478p8cxmksb7pr', 'cmo90jru3003b8p8cal8wm4vo', 'Lucrare #20 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-19 19:25:56.912', '2026-05-01 19:25:56.912', 33.00, 32.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:56.913', '2026-04-21 19:25:56.913');
INSERT INTO public."WorkOrder" VALUES ('cmo90kxj7007o8p8chjbw2p4k', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90jsuh003f8p8ctmlbcse3', 'Lucrare #21 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-07 19:25:58.339', '2026-05-10 19:25:58.339', 34.00, 29.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:25:58.34', '2026-04-21 19:25:58.34');
INSERT INTO public."WorkOrder" VALUES ('cmo90kzcl007y8p8cbh9pal4w', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90jtqk003l8p8cigcnrx1q', 'Lucrare #23 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-14 19:26:00.693', '2026-05-08 19:26:00.693', 29.00, 1.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:00.694', '2026-04-21 19:26:00.694');
INSERT INTO public."WorkOrder" VALUES ('cmo90l0e000838p8cyjny7n67', 'cmo90k66y004r8p8c51np3e4s', 'cmo90jum2003p8p8cigwqe0ga', 'Lucrare #24 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-20 19:26:02.04', '2026-04-30 19:26:02.04', 29.00, 12.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:02.041', '2026-04-21 19:26:02.041');
INSERT INTO public."WorkOrder" VALUES ('cmo90kyeh007t8p8cqxwpegs1', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90jtqk003j8p8czr687t4d', 'Lucrare #22 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-16 19:25:59.465', '2026-04-29 19:25:59.465', 32.00, 36.00, 'CANCELED', 'HIGH', 0, NULL, false, NULL, true, NULL, NULL, '2026-04-21 20:47:51.302', '2026-04-21 19:25:59.466', '2026-04-21 20:48:07.941');
INSERT INTO public."WorkOrder" VALUES ('cmo90l1g100888p8cwiqokyp8', 'cmo90jru300388p8c1ire5mdf', 'cmo90jvhh003t8p8cjgzffx0r', 'Lucrare #25 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-13 19:26:03.409', '2026-05-04 19:26:03.409', 34.00, 4.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:03.41', '2026-04-21 19:26:03.41');
INSERT INTO public."WorkOrder" VALUES ('cmo90l2ju008d8p8cb2wnhovh', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90jvhh003v8p8camgfl6yn', 'Lucrare #26 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-13 19:26:04.842', '2026-05-04 19:26:04.842', 5.00, 30.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:04.843', '2026-04-21 19:26:04.843');
INSERT INTO public."WorkOrder" VALUES ('cmo90l4qk008n8p8c9flr9m6x', 'cmo90jum2003n8p8crdn2hbox', 'cmo90jyvq00438p8ct8iir6n3', 'Lucrare #28 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-14 19:26:07.676', '2026-05-03 19:26:07.676', 27.00, 29.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:07.677', '2026-04-21 19:26:07.677');
INSERT INTO public."WorkOrder" VALUES ('cmo90l66c008s8p8cx4f5876z', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90jyvq00458p8c43hfg0il', 'Lucrare #29 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-13 19:26:09.54', '2026-05-08 19:26:09.54', 40.00, 20.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:09.541', '2026-04-21 19:26:09.541');
INSERT INTO public."WorkOrder" VALUES ('cmo90l8ax00978p8clt4go53n', 'cmo90k1in00478p8cxmksb7pr', 'cmo90k2n4004f8p8cu3wj5nsq', 'Lucrare #32 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-10 19:26:12.296', '2026-05-07 19:26:12.296', 21.00, 25.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:12.297', '2026-04-21 19:26:12.297');
INSERT INTO public."WorkOrder" VALUES ('cmo90l8ye009c8p8cq7l68evz', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90k3s1004j8p8cuh6pe19j', 'Lucrare #33 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-11 19:26:13.142', '2026-05-09 19:26:13.142', 27.00, 22.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:13.143', '2026-04-21 19:26:13.143');
INSERT INTO public."WorkOrder" VALUES ('cmo90l9m4009h8p8ce3wgs0hm', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90k4ve004n8p8c81nvtb5i', 'Lucrare #34 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-20 19:26:13.995', '2026-05-11 19:26:13.995', 36.00, 32.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:13.996', '2026-04-21 19:26:13.996');
INSERT INTO public."WorkOrder" VALUES ('cmo90laai009m8p8c8j2xoewu', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90k4ve004p8p8chd3eh8c8', 'Lucrare #35 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-19 19:26:14.873', '2026-04-28 19:26:14.873', 10.00, 20.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:14.874', '2026-04-21 19:26:14.874');
INSERT INTO public."WorkOrder" VALUES ('cmo90layd009r8p8cjhhq1xf5', 'cmo90k66y004r8p8c51np3e4s', 'cmo90k66y004t8p8cqtmfsws0', 'Lucrare #36 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-19 19:26:15.733', '2026-05-10 19:26:15.733', 24.00, 1.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:15.734', '2026-04-21 19:26:15.734');
INSERT INTO public."WorkOrder" VALUES ('cmo90lbn7009w8p8c5zaxogzg', 'cmo90jru300388p8c1ire5mdf', 'cmo90jru300398p8cdtpm4zh7', 'Lucrare #37 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-08 19:26:16.627', '2026-05-04 19:26:16.627', 20.00, 2.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:16.628', '2026-04-21 19:26:16.628');
INSERT INTO public."WorkOrder" VALUES ('cmo90lcdm00a18p8cj9tytta0', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90jru3003b8p8cal8wm4vo', 'Lucrare #38 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-20 19:26:17.578', '2026-05-07 19:26:17.578', 12.00, 9.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:17.579', '2026-04-21 19:26:17.579');
INSERT INTO public."WorkOrder" VALUES ('cmo90ldcq00a68p8ctwyp2ox2', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90jsuh003f8p8ctmlbcse3', 'Lucrare #39 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-18 19:26:18.842', '2026-05-03 19:26:18.842', 21.00, 2.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:18.842', '2026-04-21 19:26:18.842');
INSERT INTO public."WorkOrder" VALUES ('cmo90lf8k00ag8p8cmya6y89t', 'cmo90jvhh003s8p8cea5xvr00', 'cmo90jtqk003l8p8cigcnrx1q', 'Lucrare #41 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-07 19:26:21.284', '2026-05-10 19:26:21.284', 6.00, 17.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:21.284', '2026-04-21 19:26:21.284');
INSERT INTO public."WorkOrder" VALUES ('cmo90lg5m00al8p8c11dhzco3', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90jum2003p8p8cigwqe0ga', 'Lucrare #42 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-06 19:26:22.474', '2026-05-05 19:26:22.474', 12.00, 14.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:22.475', '2026-04-21 19:26:22.475');
INSERT INTO public."WorkOrder" VALUES ('cmo90lhd600aq8p8crh0v4kya', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90jvhh003t8p8cjgzffx0r', 'Lucrare #43 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-09 19:26:24.041', '2026-05-01 19:26:24.041', 40.00, 2.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:24.042', '2026-04-21 19:26:24.042');
INSERT INTO public."WorkOrder" VALUES ('cmo90ljk300b08p8c8dshbbwa', 'cmo90k2n4004c8p8cnr3rna98', 'cmo90jw9o003z8p8cwr0xfahh', 'Lucrare #45 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-15 19:26:26.801', '2026-05-04 19:26:26.801', 22.00, 34.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:26.802', '2026-04-21 19:26:26.802');
INSERT INTO public."WorkOrder" VALUES ('cmo90lkdc00b58p8c6we6ltkk', 'cmo90k3s1004h8p8cwg75w5pi', 'cmo90jyvq00438p8ct8iir6n3', 'Lucrare #46 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-12 19:26:27.936', '2026-05-06 19:26:27.936', 13.00, 17.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:27.937', '2026-04-21 19:26:27.937');
INSERT INTO public."WorkOrder" VALUES ('cmo90ll1m00ba8p8ccjmbo0wk', 'cmo90k4ve004m8p8cxmgwdlsa', 'cmo90jyvq00458p8c43hfg0il', 'Lucrare #47 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-09 19:26:28.809', '2026-05-09 19:26:28.809', 37.00, 20.00, 'BLOCKED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:28.81', '2026-04-21 19:26:28.81');
INSERT INTO public."WorkOrder" VALUES ('cmo90llnz00bf8p8c9wldo3xf', 'cmo90k66y004r8p8c51np3e4s', 'cmo90k1in00498p8crejm4fdp', 'Lucrare #48 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-16 19:26:29.615', '2026-04-29 19:26:29.615', 39.00, 28.00, 'DONE', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:29.616', '2026-04-21 19:26:29.616');
INSERT INTO public."WorkOrder" VALUES ('cmo90l6vk008x8p8c9lj26fte', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90k1in00498p8crejm4fdp', 'Lucrare #30 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-20 19:26:10.448', '2026-04-23 19:26:10.448', 17.00, 15.00, 'CANCELED', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, '2026-04-21 20:45:21.558', '2026-04-21 19:26:10.448', '2026-04-21 20:45:21.559');
INSERT INTO public."WorkOrder" VALUES ('cmo90l7mm00928p8cifi9uzxu', 'cmo90jyvq00428p8cx3o0km3g', 'cmo90k2n4004d8p8c643kczkb', 'Lucrare #31 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona A', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-14 19:26:11.346', '2026-04-26 19:26:11.346', 32.00, 12.00, 'CANCELED', 'LOW', 0, NULL, false, NULL, true, NULL, NULL, '2026-04-21 20:46:14.98', '2026-04-21 19:26:11.347', '2026-04-21 20:46:14.981');
INSERT INTO public."WorkOrder" VALUES ('cmo90l3fe008i8p8c34n6ducb', 'cmo90jtqk003i8p8cibxkcwtl', 'cmo90jw9o003z8p8cwr0xfahh', 'Lucrare #27 - Probe functionale', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona B', 'cmo90je36002c8p8c86e5snpa', 'cmo90jjoy002m8p8cph0o9ov3', '2026-04-14 19:26:05.977', '2026-04-23 19:26:05.977', 26.00, 18.00, 'CANCELED', 'LOW', 0, NULL, false, NULL, false, NULL, NULL, '2026-04-21 20:47:31.233', '2026-04-21 19:26:05.978', '2026-04-21 20:47:31.234');
INSERT INTO public."WorkOrder" VALUES ('cmo90lmc000bk8p8chmy56adq', 'cmo90jru300388p8c1ire5mdf', 'cmo90k2n4004d8p8c643kczkb', 'Lucrare #49 - Montaj corpuri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90ja3800298p8cqphzc1hi', 'cmo90jit0002i8p8cytrdeby2', '2026-04-07 19:26:30.48', '2026-05-05 19:26:30.48', 20.00, 19.00, 'TODO', 'MEDIUM', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 19:26:30.481', '2026-04-21 19:26:30.481');
INSERT INTO public."WorkOrder" VALUES ('cmo90lmzl00bp8p8cxnaqtmsb', 'cmo90jsuh003d8p8cnpiz3rtb', 'cmo90k2n4004f8p8cu3wj5nsq', 'Lucrare #50 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-19 19:26:31.329', '2026-05-06 19:26:31.329', 31.00, 27.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, NULL, '2026-04-21 19:26:31.329', '2026-04-21 19:26:31.329');
INSERT INTO public."WorkOrder" VALUES ('cmo92s8kx000q8pjp778vem2i', 'cmo92s6vi000l8pjpz0g3gacg', 'cmo92s7l3000m8pjpspdk5xdq', 'Montaj prize si iluminat', 'Lucrare unica de onboarding, cu checklist minim si responsabil clar.', 'Zona A', 'cmo92s3kh000c8pjptn0g701f', 'cmo92s51b000g8pjpwuzvszwa', '2026-04-18 20:27:38.481', '2026-04-26 20:27:38.481', 16.00, 6.00, 'IN_PROGRESS', 'HIGH', 0, NULL, false, NULL, true, NULL, NULL, NULL, '2026-04-21 20:27:38.482', '2026-04-21 20:27:38.482');
INSERT INTO public."WorkOrder" VALUES ('cmo90liu800av8p8cjk8e4qvx', 'cmo90k1in00478p8cxmksb7pr', 'cmo90jvhh003v8p8camgfl6yn', 'Lucrare #44 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona D', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-24 08:00:00', '2026-04-24 17:00:00', 11.00, 24.00, 'CANCELED', 'CRITICAL', 0, NULL, false, NULL, false, NULL, NULL, '2026-04-21 20:45:34.91', '2026-04-21 19:26:25.953', '2026-04-21 20:45:34.911');
INSERT INTO public."WorkOrder" VALUES ('cmo90knie00798p8czd71msbw', 'cmo90jw9o003x8p8cfu1ajyh1', 'cmo90k66y004t8p8cqtmfsws0', 'Lucrare #18 - Trasee cabluri', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona C', 'cmo90jbmm002a8p8cukr7msxp', 'cmo90jjac002k8p8cs5ipjj5f', '2026-04-08 19:25:45.35', '2026-04-25 19:25:45.35', 29.00, 35.00, 'CANCELED', 'HIGH', 0, NULL, false, NULL, false, NULL, NULL, '2026-04-21 20:46:41.698', '2026-04-21 19:25:45.351', '2026-04-21 20:46:41.699');
INSERT INTO public."WorkOrder" VALUES ('cmo90le9300ab8p8c4ecu45da', 'cmo90jum2003n8p8crdn2hbox', 'cmo90jtqk003j8p8czr687t4d', 'Lucrare #40 - Remediere neconformitati', 'Executie in teren cu poze inainte/dupa si checklist obligatoriu.', 'Zona E', 'cmo90jetj002d8p8c6fhl8jgg', 'cmo90jk2d002o8p8cfanc1b0b', '2026-04-09 19:26:20.006', '2026-04-28 19:26:20.006', 39.00, 34.00, 'CANCELED', 'CRITICAL', 0, NULL, false, NULL, true, NULL, NULL, '2026-04-21 20:47:45.93', '2026-04-21 19:26:20.007', '2026-04-21 20:47:45.931');


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: CostEntry CostEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CostEntry"
    ADD CONSTRAINT "CostEntry_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Equipment Equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: MaterialRequest MaterialRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaterialRequest"
    ADD CONSTRAINT "MaterialRequest_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: StockMovement StockMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_pkey" PRIMARY KEY (id);


--
-- Name: TimeEntry TimeEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimeEntry"
    ADD CONSTRAINT "TimeEntry_pkey" PRIMARY KEY (id);


--
-- Name: WorkOrder WorkOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_pkey" PRIMARY KEY (id);


--
-- Name: Attendance_date_teamId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_date_teamId_idx" ON public."Attendance" USING btree (date, "teamId");


--
-- Name: Attendance_userId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Attendance_userId_date_key" ON public."Attendance" USING btree ("userId", date);


--
-- Name: CostEntry_occurredAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CostEntry_occurredAt_idx" ON public."CostEntry" USING btree ("occurredAt");


--
-- Name: CostEntry_projectId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CostEntry_projectId_type_idx" ON public."CostEntry" USING btree ("projectId", type);


--
-- Name: Document_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_expiresAt_idx" ON public."Document" USING btree ("expiresAt");


--
-- Name: Document_projectId_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Document_projectId_category_idx" ON public."Document" USING btree ("projectId", category);


--
-- Name: Equipment_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Equipment_code_key" ON public."Equipment" USING btree (code);


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: Invoice_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_projectId_idx" ON public."Invoice" USING btree ("projectId");


--
-- Name: Invoice_status_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_status_dueDate_idx" ON public."Invoice" USING btree (status, "dueDate");


--
-- Name: MaterialRequest_projectId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaterialRequest_projectId_status_idx" ON public."MaterialRequest" USING btree ("projectId", status);


--
-- Name: MaterialRequest_requestedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaterialRequest_requestedAt_idx" ON public."MaterialRequest" USING btree ("requestedAt");


--
-- Name: Notification_userId_isRead_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON public."Notification" USING btree ("userId", "isRead", "createdAt");


--
-- Name: StockMovement_materialId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockMovement_materialId_type_idx" ON public."StockMovement" USING btree ("materialId", type);


--
-- Name: StockMovement_warehouseId_movedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockMovement_warehouseId_movedAt_idx" ON public."StockMovement" USING btree ("warehouseId", "movedAt");


--
-- Name: TimeEntry_projectId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TimeEntry_projectId_status_idx" ON public."TimeEntry" USING btree ("projectId", status);


--
-- Name: TimeEntry_userId_liveState_endAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TimeEntry_userId_liveState_endAt_idx" ON public."TimeEntry" USING btree ("userId", "liveState", "endAt");


--
-- Name: TimeEntry_userId_startAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TimeEntry_userId_startAt_idx" ON public."TimeEntry" USING btree ("userId", "startAt");


--
-- Name: WorkOrder_dueDate_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkOrder_dueDate_priority_idx" ON public."WorkOrder" USING btree ("dueDate", priority);


--
-- Name: WorkOrder_projectId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkOrder_projectId_status_idx" ON public."WorkOrder" USING btree ("projectId", status);


--
-- Name: WorkOrder_teamId_startDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkOrder_teamId_startDate_idx" ON public."WorkOrder" USING btree ("teamId", "startDate");


--
-- Name: Attendance Attendance_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Attendance Attendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CostEntry CostEntry_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CostEntry"
    ADD CONSTRAINT "CostEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CostEntry CostEntry_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CostEntry"
    ADD CONSTRAINT "CostEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Document Document_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MaterialRequest MaterialRequest_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaterialRequest"
    ADD CONSTRAINT "MaterialRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaterialRequest MaterialRequest_materialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaterialRequest"
    ADD CONSTRAINT "MaterialRequest_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."Material"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MaterialRequest MaterialRequest_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaterialRequest"
    ADD CONSTRAINT "MaterialRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MaterialRequest MaterialRequest_requestedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaterialRequest"
    ADD CONSTRAINT "MaterialRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_materialId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."Material"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockMovement StockMovement_warehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES public."Warehouse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TimeEntry TimeEntry_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimeEntry"
    ADD CONSTRAINT "TimeEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TimeEntry TimeEntry_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimeEntry"
    ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TimeEntry TimeEntry_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimeEntry"
    ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TimeEntry TimeEntry_workOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimeEntry"
    ADD CONSTRAINT "TimeEntry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES public."WorkOrder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."ProjectPhase"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkOrder WorkOrder_responsibleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkOrder WorkOrder_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkOrder"
    ADD CONSTRAINT "WorkOrder_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict wnU2GlwhzNbYPdNKmjUZPylh8Jn8OolfuBac7N4BJya14G8CSmmaLogAsgI95sw

