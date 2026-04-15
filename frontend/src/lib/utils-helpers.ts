import { Role } from "./types";

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((item) => item[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("uz-UZ").format(amount)} so'm`;
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("uz-UZ");
}

export function roleLabel(role: Role) {
  const labels: Record<Role, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    TEACHER: "Oqituvchi",
    STUDENT: "Oquvchi",
    PARENT: "Ota-ona",
    STAFF: "Xodim",
  };

  return labels[role];
}

export function roleBadgeClass(role: Role) {
  const colors: Record<Role, string> = {
    SUPER_ADMIN:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    ADMIN: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    TEACHER:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    STUDENT:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    PARENT:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    STAFF:
      "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300",
  };

  return colors[role];
}
