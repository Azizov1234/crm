"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  UserRoundPlus,
  Users2,
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
import { ApiError } from "@/lib/api/client";
import { groupsApi, parentsApi, studentsApi } from "@/lib/api/services";
import { Status, Student } from "@/lib/types";
import { formatDate } from "@/lib/utils-helpers";

const STATUS_OPTIONS: Status[] = ["ACTIVE", "INACTIVE", "ARCHIVED", "DELETED"];

type Option = { id: string; name: string };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [parents, setParents] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    studentNo: "",
    avatarUrl: "",
    parentIds: [] as string[],
    groupIds: [] as string[],
  });

  const totalCount = useMemo(() => students.length, [students]);

  async function loadStudents() {
    try {
      setLoading(true);
      const response = await studentsApi.list({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
      });
      setStudents(response.data);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "O'quvchilar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    try {
      const [parentsResponse, groupsResponse] = await Promise.all([
        parentsApi.list({ page: 1, limit: 100, status: "ACTIVE" }),
        groupsApi.list({ page: 1, limit: 100, status: "ACTIVE" }),
      ]);

      const parentOptions = (parentsResponse.data as Array<Record<string, unknown>>).map((item) => {
        const user = item.user as Record<string, unknown> | undefined;
        const firstName = String(user?.firstName ?? "");
        const lastName = String(user?.lastName ?? "");
        return { id: String(item.id), name: `${firstName} ${lastName}`.trim() || String(item.id) };
      });
      const groupOptions = groupsResponse.data.map((item) => ({ id: item.id, name: item.name }));

      setParents(parentOptions);
      setGroups(groupOptions);
    } catch {
      setParents([]);
      setGroups([]);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, [status]); // Automatically refetch when status changes

  useEffect(() => {
    void loadOptions();
  }, []);

  async function createStudent() {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      toast.error("Ism va familiya majburiy");
      return;
    }

    try {
      await studentsApi.create({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        studentNo: draft.studentNo.trim() || undefined,
        avatarUrl: draft.avatarUrl.trim() || undefined,
        parentIds: draft.parentIds.length ? draft.parentIds : undefined,
        groupIds: draft.groupIds.length ? draft.groupIds : undefined,
      });
      toast.success("Yangi o'quvchi qo'shildi");
      setOpenCreateModal(false);
      setDraft({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        studentNo: "",
        avatarUrl: "",
        parentIds: [],
        groupIds: [],
      });
      await loadStudents();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Yaratishda xatolik");
    }
  }

  async function softDeleteStudent(id: string) {
    try {
      await studentsApi.remove(id);
      toast.success("O'quvchi o'chirildi");
      await loadStudents();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Delete amalga oshmadi");
    }
  }

  function toggleListValue(key: "parentIds" | "groupIds", id: string) {
    setDraft((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x) => x !== id) : [...prev[key], id],
    }));
  }

  return (
    <DashboardLayout title="O'quvchilar" description="Student profile, ota-ona va guruh biriktirish">
      <PageHero
        title="O'quvchilar"
        subtitle="Yangi o'quvchilarni qo'shing va biriktirishlarni boshqaring"
        icon={Users2}
        statLabel="Jami o'quvchilar"
        statValue={totalCount}
      />

      <SearchToolbar
        value={search}
        onChange={setSearch}
        onFilter={loadStudents}
        placeholder="O'quvchilarni qidiring..."
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
              O'quvchi qo'shish
            </GradientButton>
          </>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          title="O'quvchilar topilmadi"
          subtitle="Filterlarni tekshiring yoki yangi o'quvchi qo'shing."
          action={
            <GradientButton className="rounded-xl px-5" onClick={() => setOpenCreateModal(true)}>
              <UserRoundPlus className="mr-1 h-4 w-4" />
              O'quvchi qo'shish
            </GradientButton>
          }
        />
      ) : viewMode === "grid" ? (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => (
            <article key={student.id} className="panel-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#2e3655]">{student.name}</h3>
                <Badge variant={student.isActive ? "secondary" : "outline"}>{student.status}</Badge>
              </div>
              <div className="space-y-1 text-sm text-[#5f6888]">
                <p>Telefon: {student.phone ?? "-"}</p>
                <p>Email: {student.email ?? "-"}</p>
                <p>Student No: {student.studentNo ?? "-"}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#edf1fb] pt-3">
                <span className="text-xs text-[#8f99b7]">{formatDate(student.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#c7475c] hover:bg-[#fff0f3]"
                  onClick={() => softDeleteStudent(student.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="panel-surface overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_0.9fr_0.5fr] gap-3 border-b border-[#edf1fb] bg-[#f6f8fe] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f99b7]">
            <span>O'quvchi</span>
            <span>Student No</span>
            <span>Aloqa</span>
            <span>Status</span>
            <span className="text-right">Amallar</span>
          </div>
          <div className="divide-y divide-[#edf1fb]">
            {students.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_0.9fr_0.5fr] items-center gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#2f3655]">{student.name}</p>
                  <p className="text-xs text-[#8f99b7]">{formatDate(student.createdAt)}</p>
                </div>
                <span className="text-[#616b8e]">{student.studentNo ?? "-"}</span>
                <span className="truncate text-[#616b8e]">{student.phone ?? student.email ?? "-"}</span>
                <Badge variant={student.isActive ? "secondary" : "outline"}>{student.status}</Badge>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#c7475c] hover:bg-[#fff0f3]"
                    onClick={() => softDeleteStudent(student.id)}
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
        title="Yangi O'quvchi"
        subtitle="Yangi yozuv yaratish uchun ma'lumotlarni kiriting"
      >
        <div className="space-y-4">
          <StepSection
            step={1}
            title="Shaxsiy ma'lumotlar"
            hint="Asosiy account va profil ma'lumotlari"
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
                  placeholder="student@academy.uz"
                />
              </Field>
              <Field label="Student No">
                <Input
                  className="soft-input h-11"
                  value={draft.studentNo}
                  onChange={(event) => setDraft((prev) => ({ ...prev, studentNo: event.target.value }))}
                  placeholder="ST-1021"
                />
              </Field>
            </div>
          </StepSection>

          <StepSection
            step={2}
            title="Ota-ona / vasiy"
            hint="O'quvchiga bir yoki bir nechta vasiy biriktirish"
          >
            <MultiSelectPanel
              options={parents}
              selected={draft.parentIds}
              onToggle={(id) => toggleListValue("parentIds", id)}
              emptyLabel="Aktiv ota-onalar topilmadi"
            />
          </StepSection>

          <StepSection step={3} title="Profil rasmi" hint="Ixtiyoriy">
            <AvatarUploadField
              value={draft.avatarUrl || undefined}
              onChange={(url) =>
                setDraft((prev) => ({
                  ...prev,
                  avatarUrl: url ?? "",
                }))
              }
              title="Profil rasmini qo'shish"
              hint="Cloudinary ga yuklanadi va create payloadga qo'shiladi"
            />
          </StepSection>

          <StepSection step={4} title="Guruhlarga biriktirish" hint="Ixtiyoriy">
            <MultiSelectPanel
              options={groups}
              selected={draft.groupIds}
              onToggle={(id) => toggleListValue("groupIds", id)}
              emptyLabel="Aktiv guruhlar topilmadi"
            />
          </StepSection>

          <GradientButton className="h-12 w-full rounded-xl text-base" onClick={createStudent}>
            O'quvchi yaratish
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

function MultiSelectPanel({
  options,
  selected,
  onToggle,
  emptyLabel,
}: {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyLabel: string;
}) {
  if (!options.length) {
    return (
      <div className="rounded-xl border border-[#e7ecf8] bg-[#fbfcff] px-3 py-2 text-sm text-[#8f99b7]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={`rounded-xl border px-3 py-1.5 text-sm transition ${
              active
                ? "border-[#5b60e4] bg-[#eef0ff] text-[#3f49c8]"
                : "border-[#dce3f5] bg-white text-[#677298] hover:border-[#b6c1e5]"
            }`}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
