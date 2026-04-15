"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Filter,
  GraduationCap,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
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
import { teachersApi } from "@/lib/api/services";
import { Status, Teacher } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils-helpers";

const STATUS_OPTIONS: Status[] = ["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    specialty: "",
    salary: "",
    hiredAt: "",
    bio: "",
    avatarUrl: "",
  });

  const totalCount = useMemo(() => teachers.length, [teachers]);

  async function loadTeachers() {
    try {
      setLoading(true);
      const response = await teachersApi.list({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
      });
      setTeachers(response.data);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "O'qituvchilar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTeachers();
  }, [status]); // Automatically refetch when status changes

  async function createTeacher() {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      toast.error("Ism va familiya majburiy");
      return;
    }

    try {
      await teachersApi.create({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        specialty: draft.specialty.trim() || undefined,
        salary: draft.salary ? Number(draft.salary) : undefined,
        hiredAt: draft.hiredAt || undefined,
        bio: draft.bio.trim() || undefined,
        avatarUrl: draft.avatarUrl.trim() || undefined,
      });
      toast.success("Yangi o'qituvchi qo'shildi");
      setOpenCreateModal(false);
      setDraft({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        specialty: "",
        salary: "",
        hiredAt: "",
        bio: "",
        avatarUrl: "",
      });
      await loadTeachers();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Yaratishda xatolik");
    }
  }

  async function softDeleteTeacher(id: string) {
    try {
      await teachersApi.remove(id);
      toast.success("O'qituvchi o'chirildi");
      await loadTeachers();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Delete amalga oshmadi");
    }
  }

  return (
    <DashboardLayout title="O'qituvchilar" description="Teacher profile va account boshqaruvi">
      <PageHero
        title="O'qituvchilar"
        subtitle="O'qituvchilar ro'yxatini yuriting va yangi o'qituvchi qo'shing"
        icon={GraduationCap}
        statLabel="Jami o'qituvchilar"
        statValue={totalCount}
      />

      <SearchToolbar
        value={search}
        onChange={setSearch}
        onFilter={loadTeachers}
        placeholder="O'qituvchilarni qidiring..."
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
              O'qituvchi qo'shish
            </GradientButton>
          </>
        }
      />

      {teachers.length === 0 ? (
        <EmptyState
          title="O'qituvchilar topilmadi"
          subtitle="Filterlarni tekshiring yoki yangi o'qituvchi qo'shing."
          action={
            <GradientButton className="rounded-xl px-5" onClick={() => setOpenCreateModal(true)}>
              <UserRoundPlus className="mr-1 h-4 w-4" />
              O'qituvchi qo'shish
            </GradientButton>
          }
        />
      ) : viewMode === "grid" ? (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teachers.map((teacher) => (
            <article key={teacher.id} className="panel-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#2e3655]">{teacher.name}</h3>
                <Badge variant={teacher.isActive ? "secondary" : "outline"}>{teacher.status}</Badge>
              </div>
              <div className="space-y-1 text-sm text-[#5f6888]">
                <p>Telefon: {teacher.phone ?? "-"}</p>
                <p>Email: {teacher.email ?? "-"}</p>
                <p>Mutaxassislik: {teacher.specialty ?? "-"}</p>
                <p>Maosh: {teacher.salary ? formatCurrency(teacher.salary) : "-"}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#edf1fb] pt-3">
                <span className="text-xs text-[#8f99b7]">{formatDate(teacher.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#c7475c] hover:bg-[#fff0f3]"
                  onClick={() => softDeleteTeacher(teacher.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="panel-surface overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr_0.5fr] gap-3 border-b border-[#edf1fb] bg-[#f6f8fe] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f99b7]">
            <span>O'qituvchi</span>
            <span>Aloqa</span>
            <span>Mutaxassislik</span>
            <span>Maosh</span>
            <span>Status</span>
            <span className="text-right">Amallar</span>
          </div>
          <div className="divide-y divide-[#edf1fb]">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.9fr_0.5fr] items-center gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#2f3655]">{teacher.name}</p>
                  <p className="text-xs text-[#8f99b7]">{formatDate(teacher.createdAt)}</p>
                </div>
                <span className="truncate text-[#616b8e]">{teacher.phone ?? teacher.email ?? "-"}</span>
                <span className="truncate text-[#616b8e]">{teacher.specialty ?? "-"}</span>
                <span className="text-[#2f3655]">
                  {teacher.salary ? formatCurrency(teacher.salary) : "-"}
                </span>
                <Badge variant={teacher.isActive ? "secondary" : "outline"}>{teacher.status}</Badge>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#c7475c] hover:bg-[#fff0f3]"
                    onClick={() => softDeleteTeacher(teacher.id)}
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
        title="Yangi O'qituvchi"
        subtitle="Yangi yozuv yaratish uchun ma'lumotlarni kiriting"
      >
        <div className="space-y-4">
          <StepSection
            step={1}
            title="Shaxsiy ma'lumotlar"
            hint="O'qituvchi uchun asosiy account va profil ma'lumotlari"
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
              <Field label="Telefon raqami">
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
                  placeholder="teacher@academy.uz"
                />
              </Field>
              <Field label="Mutaxassislik">
                <Input
                  className="soft-input h-11"
                  value={draft.specialty}
                  onChange={(event) => setDraft((prev) => ({ ...prev, specialty: event.target.value }))}
                  placeholder="Matematika"
                />
              </Field>
              <Field label="Maosh">
                <Input
                  className="soft-input h-11"
                  type="number"
                  value={draft.salary}
                  onChange={(event) => setDraft((prev) => ({ ...prev, salary: event.target.value }))}
                  placeholder="4500000"
                />
              </Field>
              <Field label="Ishga olingan sana">
                <div className="relative">
                  <Input
                    className="soft-input h-11 pr-10"
                    type="date"
                    value={draft.hiredAt}
                    onChange={(event) => setDraft((prev) => ({ ...prev, hiredAt: event.target.value }))}
                  />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa4c0]" />
                </div>
              </Field>
              <Field label="Bio">
                <Textarea
                  className="soft-input min-h-24"
                  value={draft.bio}
                  onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
                  placeholder="Qisqa izoh"
                />
              </Field>
            </div>
          </StepSection>

          <StepSection
            step={2}
            title="Profil rasmi"
            hint="Cloudinary orqali rasm yuklash"
          >
            <AvatarUploadField
              value={draft.avatarUrl || undefined}
              onChange={(url) =>
                setDraft((prev) => ({
                  ...prev,
                  avatarUrl: url ?? "",
                }))
              }
              title="Profil rasmini qo'shish"
              hint="Ixtiyoriy, lekin create paytida ham yuboriladi"
            />
          </StepSection>

          <GradientButton className="h-12 w-full rounded-xl text-base" onClick={createTeacher}>
            O'qituvchi yaratish
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
