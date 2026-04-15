"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { Filter, LayoutGrid, List, Plus, ShieldCheck, Trash2, UserPlus2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  AvatarUploadField,
  EmptyState,
  GradientButton,
  ModalShell,
  PageHero,
  SearchToolbar,
  StepSection,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { adminsApi, usersApi } from "@/lib/api/services";
import { Status } from "@/lib/types";
import { formatDate } from "@/lib/utils-helpers";

const STATUS_OPTIONS: Status[] = ["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"];

type AdminRow = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  role: string;
  branchName: string | null;
  status: string;
  isActive: boolean;
  createdAt: string | null;
};

type Option = { id: string; name: string };

const EMPTY_ADMIN_DRAFT = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  notes: "",
  avatarUrl: "",
  branchId: "NONE",
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function mapAdminRow(raw: unknown): AdminRow {
  const item = toRecord(raw);
  const user = toRecord(item.user);
  const branch = toRecord(item.branch);
  const firstName = asString(user.firstName).trim();
  const lastName = asString(user.lastName).trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const status = asString(item.status) || "ACTIVE";

  return {
    id: asString(item.id),
    fullName: fullName || "Noma'lum",
    phone: asNullableString(user.phone),
    email: asNullableString(user.email),
    notes: asNullableString(item.notes),
    role: asString(user.role) || "ADMIN",
    branchName: asNullableString(branch.name),
    status,
    isActive: status === "ACTIVE",
    createdAt: asNullableString(item.createdAt),
  };
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [draft, setDraft] = useState(EMPTY_ADMIN_DRAFT);
  const [branches, setBranches] = useState<Option[]>([]);
  const [attachUserId, setAttachUserId] = useState("NONE");
  const [attachNotes, setAttachNotes] = useState("");

  const totalCount = useMemo(() => admins.length, [admins]);

  async function loadAdmins() {
    try {
      setLoading(true);
      const response = await adminsApi.list({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
      });
      setAdmins((response.data as unknown[]).map(mapAdminRow));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Adminlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const response = await usersApi.selectOptions();
      setUsers(response.map((item) => ({ id: item.id, name: item.name })));
    } catch {
      setUsers([]);
    }
  }

  async function loadBranches() {
    try {
      const response = await (await import("@/lib/api/services")).branchesApi.list({ limit: 100 });
      setBranches((response.data as any[]).map(b => ({ id: b.id, name: b.name })));
    } catch {
      setBranches([]);
    }
  }

  useEffect(() => {
    void loadAdmins();
  }, [status]); // Automatically refetch when status changes

  useEffect(() => {
    void loadUsers();
    void loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAdmin() {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      toast.error("Ism va familiya majburiy");
      return;
    }

    try {
      await adminsApi.create({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        password: draft.password.trim() || undefined,
        notes: draft.notes.trim() || undefined,
        avatarUrl: draft.avatarUrl.trim() || undefined,
        branchId: draft.branchId === "NONE" ? undefined : draft.branchId,
      });
      toast.success("Yangi admin yaratildi");
      setOpenCreateModal(false);
      setDraft(EMPTY_ADMIN_DRAFT);
      setAttachUserId("NONE");
      setAttachNotes("");
      await loadAdmins();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Yaratishda xatolik");
    }
  }

  async function attachExistingUser() {
    if (attachUserId === "NONE") {
      toast.error("Biriktirish uchun userni tanlang");
      return;
    }

    try {
      await adminsApi.attachExistingUser({
        userId: attachUserId,
        notes: attachNotes.trim() || undefined,
      });
      toast.success("Mavjud user admin sifatida biriktirildi");
      setOpenCreateModal(false);
      setAttachUserId("NONE");
      setAttachNotes("");
      await loadAdmins();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Biriktirishda xatolik");
    }
  }

  async function softDeleteAdmin(id: string) {
    try {
      await adminsApi.remove(id);
      toast.success("Admin o'chirildi");
      await loadAdmins();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Delete amalga oshmadi");
    }
  }

  return (
    <DashboardLayout title="Adminlar" description="Admin account va role boshqaruvi">
      <PageHero
        title="Adminlar"
        subtitle="Yangi admin qo'shing yoki mavjud userni admin sifatida biriktiring"
        icon={ShieldCheck}
        statLabel="Jami adminlar"
        statValue={totalCount}
      />

      <SearchToolbar
        value={search}
        onChange={(val) => {
          setSearch(val);
        }}
        onFilter={loadAdmins}
        placeholder="Adminga oid ma'lumot (ism, email) qidiring, va 'Filterlash'ni bosing..."
        actions={
          <>
            <Select value={status} onValueChange={(value) => setStatus(value ?? "ACTIVE")}>
              <SelectTrigger className="h-11 rounded-xl border-[#e3e8f4] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Barcha status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-[#e3e8f4] bg-white px-3"
              onClick={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <GradientButton className="h-11 rounded-xl px-4" onClick={() => setOpenCreateModal(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Admin qo'shish
            </GradientButton>
          </>
        }
      />

      {!admins.length ? (
        <EmptyState
          title="Adminlar topilmadi"
          subtitle="Filterlarni tekshiring yoki yangi admin qo'shing."
          action={
            <GradientButton className="rounded-xl px-5" onClick={() => setOpenCreateModal(true)}>
              <UserPlus2 className="mr-1 h-4 w-4" />
              Admin qo'shish
            </GradientButton>
          }
        />
      ) : viewMode === "grid" ? (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {admins.map((admin) => (
            <article key={admin.id} className="panel-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#2e3655]">{admin.fullName}</h3>
                <Badge variant={admin.isActive ? "secondary" : "outline"}>{admin.status}</Badge>
              </div>
              <div className="space-y-1 text-sm text-[#5f6888]">
                <p>Rol: {admin.role}</p>
                <p>Aloqa: {admin.phone ?? admin.email ?? "-"}</p>
                <p>Filial: {admin.branchName ?? "-"}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#edf1fb] pt-3">
                <span className="text-xs text-[#8f99b7]">{formatDate(admin.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#c7475c] hover:bg-[#fff0f3]"
                  onClick={() => softDeleteAdmin(admin.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="panel-surface overflow-hidden">
          <div className="grid grid-cols-[1.2fr_0.9fr_1fr_1fr_0.8fr_0.5fr] gap-3 border-b border-[#edf1fb] bg-[#f6f8fe] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f99b7]">
            <span>Admin</span>
            <span>Rol</span>
            <span>Aloqa</span>
            <span>Filial</span>
            <span>Status</span>
            <span className="text-right">Amallar</span>
          </div>
          <div className="divide-y divide-[#edf1fb]">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-[1.2fr_0.9fr_1fr_1fr_0.8fr_0.5fr] items-center gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#2f3655]">{admin.fullName}</p>
                  <p className="text-xs text-[#8f99b7]">{formatDate(admin.createdAt)}</p>
                </div>
                <span className="truncate text-[#616b8e]">{admin.role}</span>
                <span className="truncate text-[#616b8e]">{admin.phone ?? admin.email ?? "-"}</span>
                <span className="truncate text-[#616b8e]">{admin.branchName ?? "-"}</span>
                <Badge variant={admin.isActive ? "secondary" : "outline"}>{admin.status}</Badge>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#c7475c] hover:bg-[#fff0f3]"
                    onClick={() => softDeleteAdmin(admin.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ModalShell
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        title="Yangi Admin"
        subtitle="Yangi yozuv yaratish yoki mavjud userni biriktirish"
      >
        <div className="space-y-4">
          <StepSection
            step={1}
            title="Shaxsiy ma'lumotlar"
            hint="Yangi admin uchun account ma'lumotlari"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Ism *">
                <Input
                  className="soft-input h-11"
                  value={draft.firstName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="Ism"
                />
              </Field>
              <Field label="Familiya *">
                <Input
                  className="soft-input h-11"
                  value={draft.lastName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Familiya"
                />
              </Field>
              <Field label="Telefon">
                <Input
                  className="soft-input h-11"
                  value={draft.phone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+998 90 123 45 67"
                />
              </Field>
              <Field label="Email">
                <Input
                  className="soft-input h-11"
                  value={draft.email}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="admin@academy.uz"
                />
              </Field>
              <Field label="Filial (ixtiyoriy)">
                <Select value={draft.branchId} onValueChange={(value) => setDraft(p => ({ ...p, branchId: value || "NONE" }))}>
                  <SelectTrigger className="soft-input h-11">
                    <SelectValue placeholder="Filialni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Filial tanlanmagan (Super Admin)</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Parol (ixtiyoriy)">
                <Input
                  className="soft-input h-11"
                  value={draft.password}
                  onChange={(event) => setDraft((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Admin123!"
                />
              </Field>
              <Field label="Izoh">
                <Textarea
                  className="soft-input min-h-24"
                  value={draft.notes}
                  onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Mas'ul bo'lim yoki eslatma"
                />
              </Field>
            </div>
          </StepSection>

          <StepSection step={2} title="Profil rasmi" hint="Ixtiyoriy: Cloudinary upload">
            <AvatarUploadField
              value={draft.avatarUrl || undefined}
              onChange={(url) =>
                setDraft((prev) => ({
                  ...prev,
                  avatarUrl: url ?? "",
                }))
              }
              title="Admin avatarini yuklash"
              hint="Yuklangan rasm create paytida backendga yuboriladi"
            />
          </StepSection>

          <StepSection
            step={3}
            title="SMS orqali kirish ma'lumoti yuborish"
            hint="Parol kiritilmasa backend default parol bilan yaratadi"
          >
            <div className="rounded-xl border border-[#e7ecf8] bg-[#fbfcff] px-3 py-2 text-sm text-[#69749a]">
              Create bosilgandan keyin login ma'lumotlarini SMS moduli orqali yuborishingiz mumkin.
            </div>
          </StepSection>

          <StepSection step={4} title="Mavjud userga bog'lash" hint="Yangi yaratmasdan mavjud userni admin qiling">
            <div className="space-y-3">
              <Field label="Mavjud user">
                <Select value={attachUserId} onValueChange={(value) => setAttachUserId(value ?? "NONE")}>
                  <SelectTrigger className="soft-input h-11">
                    <SelectValue placeholder="Userni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">User tanlanmagan</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Biriktirish izohi">
                <Textarea
                  className="soft-input min-h-20"
                  value={attachNotes}
                  onChange={(event) => setAttachNotes(event.target.value)}
                  placeholder="Ixtiyoriy izoh"
                />
              </Field>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-[#dce3f5] bg-white text-[#4b58cf]"
                onClick={attachExistingUser}
              >
                Mavjud userni admin sifatida biriktirish
              </Button>
            </div>
          </StepSection>

          <GradientButton className="h-12 w-full rounded-xl text-base" onClick={createAdmin}>
            Admin yaratish
          </GradientButton>
        </div>
      </ModalShell>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-[#7c87a9]">{label}</span>
      {children}
    </label>
  );
}
