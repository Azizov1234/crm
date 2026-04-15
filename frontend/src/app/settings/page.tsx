"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { Building2, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHero } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { settingsApi } from "@/lib/api/services";

interface OrganizationSettings {
  id: string;
  name: string;
  code?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  timezone?: string | null;
  locale?: string | null;
  currency?: string | null;
  primaryColor?: string | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [organization, setOrganization] = useState<OrganizationSettings | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    code: "",
    phone: "",
    email: "",
    website: "",
    timezone: "",
    locale: "",
    currency: "",
    primaryColor: "",
  });

  async function loadOrganization() {
    try {
      setLoading(true);
      const response = await settingsApi.getOrganization();
      const data = response as OrganizationSettings;
      setOrganization(data);
      setDraft({
        name: data.name ?? "",
        code: data.code ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        timezone: data.timezone ?? "",
        locale: data.locale ?? "",
        currency: data.currency ?? "",
        primaryColor: data.primaryColor ?? "",
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Sozlamalar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrganization();
  }, []);

  async function saveOrganization() {
    try {
      setLoading(true);
      const updated = await settingsApi.updateOrganization({
        name: draft.name || undefined,
        code: draft.code || undefined,
        phone: draft.phone || undefined,
        email: draft.email || undefined,
        website: draft.website || undefined,
        timezone: draft.timezone || undefined,
        locale: draft.locale || undefined,
        currency: draft.currency || undefined,
        primaryColor: draft.primaryColor || undefined,
      });
      setOrganization(updated as OrganizationSettings);
      toast.success("Sozlamalar saqlandi");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Yangilashda xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function uploadLogo() {
    if (!logoFile) {
      toast.error("Logo faylini tanlang");
      return;
    }

    try {
      setUploading(true);
      const updated = await settingsApi.uploadLogo(logoFile);
      setOrganization(updated as OrganizationSettings);
      setLogoFile(null);
      toast.success("Logo yangilandi");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Logo yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardLayout title="Sozlamalar" description="Tashkilot va filiallar bo'yicha sozlamalar">
      <PageHero
        title="Sozlamalar"
        subtitle="Tashkilot sozlamalari va filiallar boshqaruvi"
        icon={Building2}
      />

      <section className="panel-surface max-w-[760px] p-4">
        <h3 className="mb-4 text-lg font-semibold text-[#2f3655]">Tashkilot tafsilotlari</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-2">
            <Label className="text-[#6f7ca2]">Logotip</Label>
            {organization?.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt="Organization logo"
                className="h-20 w-20 rounded-2xl border border-[#e3e8f4] object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-[#d2dbf1] bg-[#f8faff] text-[#8f9bc2]">
                <UploadCloud className="h-6 w-6" />
              </div>
            )}
            <Input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
            <Button
              variant="outline"
              className="w-full rounded-xl border-[#dbe2f4]"
              onClick={uploadLogo}
              disabled={uploading}
            >
              {uploading ? "Yuklanmoqda..." : "Logotipni o'zgartirish"}
            </Button>
          </div>

          <div className="space-y-3">
            <Field label="O'quv markazi nomi">
              <Input
                className="soft-input h-11"
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Academy nomi"
              />
            </Field>
            <Field label="Kod">
              <Input
                className="soft-input h-11"
                value={draft.code}
                onChange={(event) => setDraft((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="academy-code"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Telefon">
                <Input
                  className="soft-input h-11"
                  value={draft.phone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+998..."
                />
              </Field>
              <Field label="Email">
                <Input
                  className="soft-input h-11"
                  value={draft.email}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="info@academy.uz"
                />
              </Field>
              <Field label="Timezone">
                <Input
                  className="soft-input h-11"
                  value={draft.timezone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                  placeholder="Asia/Tashkent"
                />
              </Field>
              <Field label="Currency">
                <Input
                  className="soft-input h-11"
                  value={draft.currency}
                  onChange={(event) => setDraft((prev) => ({ ...prev, currency: event.target.value }))}
                  placeholder="UZS"
                />
              </Field>
            </div>
            <Field label="Website">
              <Input
                className="soft-input h-11"
                value={draft.website}
                onChange={(event) => setDraft((prev) => ({ ...prev, website: event.target.value }))}
                placeholder="https://academy.uz"
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-[#edf1fb] pt-4">
          <Button className="gradient-primary rounded-xl px-5 text-white" onClick={saveOrganization} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
          </Button>
        </div>
      </section>

      <section className="panel-surface max-w-[760px] border border-[#dbe8ff] bg-[#f4f8ff] p-4">
        <h3 className="text-lg font-semibold text-[#2f3655]">Filiallarni boshqarish</h3>
        <p className="mt-1 text-sm text-[#6f7ca2]">Tashkilot uchun filiallar yaratish va boshqarish</p>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d5e2ff] bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#2f3655]">Filiallarni boshqarish</p>
            <p className="text-xs text-[#8b95b3]">Filial qo'shing, tahrirlang yoki o'chiring</p>
          </div>
          <Button className="gradient-primary rounded-xl text-white" onClick={() => (window.location.href = "/branches")}>
            Filiallarni boshqarish
          </Button>
        </div>
      </section>
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
