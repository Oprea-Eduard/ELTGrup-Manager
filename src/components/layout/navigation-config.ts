import type { LucideIcon } from "lucide-react";
import type { AppModule } from "@/src/lib/access-control";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileText,
  HardHat,
  History,
  LayoutDashboard,
  Package,
  Receipt,
  ScrollTextIcon,
  Settings,
  Smartphone,
  Timer,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

export type NavItem = {
  module: AppModule;
  href: string;
  label: string;
  icon: LucideIcon;
  section: "Operare" | "Proiecte" | "Resurse" | "Financiar" | "Sistem";
  sub?: boolean;
};

export const navItems: NavItem[] = [
  // ─── Operare (daily work) ───
  { module: "dashboard", href: "/panou", label: "Panou", icon: LayoutDashboard, section: "Operare" },
  { module: "calendar", href: "/calendar", label: "Calendar", icon: CalendarDays, section: "Operare" },
  { module: "time_tracking", href: "/pontaj", label: "Pontaj", icon: Timer, section: "Operare" },
  { module: "reports", href: "/rapoarte-zilnice", label: "Rapoarte", icon: HardHat, section: "Operare" },

  // ─── Proiecte ───
  { module: "projects", href: "/proiecte", label: "Proiecte", icon: BriefcaseBusiness, section: "Proiecte" },
  { module: "work_orders", href: "/lucrari", label: "Lucrari", icon: ClipboardList, section: "Proiecte" },
  { module: "offers", href: "/oferte", label: "Oferte", icon: ScrollTextIcon, section: "Proiecte" },

  // ─── Resurse ───
  { module: "teams", href: "/echipe", label: "Echipe", icon: Users, section: "Resurse" },
  { module: "materials", href: "/materiale", label: "Depozit", icon: Package, section: "Resurse" },
  { module: "materials", href: "/gestiune-scule", label: "Scule", icon: Wrench, section: "Resurse", sub: true },
  { module: "materials", href: "/materiale?tab=echipamente", label: "Echipamente", icon: Smartphone, section: "Resurse", sub: true },
  { module: "subcontractors", href: "/subcontractori", label: "Subcontractori", icon: Truck, section: "Resurse" },

  // ─── Financiar ───
  { module: "financial", href: "/financiar", label: "Financiar", icon: Receipt, section: "Financiar" },
  { module: "clients", href: "/clienti", label: "Clienti", icon: Users, section: "Financiar" },
  { module: "documents", href: "/documente", label: "Documente", icon: FileText, section: "Financiar" },

  // ─── Sistem ───
  { module: "notifications", href: "/notificari", label: "Notificari", icon: Bell, section: "Sistem" },
  { module: "settings", href: "/setari", label: "Setari", icon: Settings, section: "Sistem" },
  { module: "settings", href: "/setari?tab=activitate", label: "Activitate", icon: History, section: "Sistem", sub: true },
];

export const navSections: Array<NavItem["section"]> = ["Operare", "Proiecte", "Resurse", "Financiar", "Sistem"];
