"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { CalendarClock, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GradientButton, PageHero } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { tariffsApi } from "@/lib/api/services";
import { formatCurrency, formatDate } from "@/lib/utils-helpers";

type TariffPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  studentLimit: number;
  branchLimit: number;
  features?: unknown;
  status: string;
};

type CurrentSubscription = {
  id: string;
  startDate: string;
  endDate: string;
  subscriptionStatus: string;
  autoRenew: boolean;
  tariffPlan?: TariffPlan | null;
} | null;

export default function TariffsPage() {
  const [plans, setPlans] = useState<TariffPlan[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    price: "",
    durationDays: "",
    studentLimit: "",
    branchLimit: "",
    features: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      const [plansResponse, currentResponse] = await Promise.all([
        tariffsApi.plans.list({ page: 1, limit: 100, status: "ACTIVE" }),
        tariffsApi.subscriptions.current(),
      ]);
      setPlans((plansResponse.data as TariffPlan[]) ?? []);
      setCurrent(
        ((currentResponse as { data?: CurrentSubscription }).data ??
          (currentResponse as CurrentSubscription)) as CurrentSubscription,
      );
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Tariflar yuklanmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createPlan() {
    if (!draft.name.trim() || !draft.price || !draft.durationDays || !draft.studentLimit || !draft.branchLimit) {
      toast.error("Reja nomi va limitlar majburiy");
      return;
    }

    let parsedFeatures: unknown = undefined;
    if (draft.features.trim()) {
      try {
        parsedFeatures = JSON.parse(draft.features);
      } catch {
        parsedFeatures = draft.features;
      }
    }

    try {
      await tariffsApi.plans.create({
        name: draft.name.trim(),
        price: Number(draft.price),
        durationDays: Number(draft.durationDays),
        studentLimit: Number(draft.studentLimit),
        branchLimit: Number(draft.branchLimit),
        features: parsedFeatures,
      });
      toast.success("Tarif rejasi yaratildi");
      setDraft({
        name: "",
        price: "",
        durationDays: "",
        studentLimit: "",
        branchLimit: "",
        features: "",
      });
      await loadData();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Tarif yaratilmadi");
    }
  }

  return (
    <DashboardLayout title="Tariflar" description="Tarif rejalari va joriy subscription nazorati">
      <PageHero
        title="Tariflar"
        subtitle="Tarif planlari va joriy obuna holatini kuzating"
        icon={ShieldCheck}
        statLabel="Faol tariflar"
        statValue={plans.length}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_2fr]">
        <article className="panel-surface p-4">
          <h3 className="mb-2 text-base font-semibold text-[#2f3655]">Joriy subscription</h3>
          {!current ? (
            <p className="text-sm text-[#8b95b3]">Joriy subscription topilmadi</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-[#2f3655]">{current.tariffPlan?.name ?? "N/A"}</p>
              <p className="text-[#616b8e]">Holat: {current.subscriptionStatus}</p>
              <p className="text-[#616b8e]">Boshlanish: {formatDate(current.startDate)}</p>
              <p className="text-[#616b8e]">Tugash: {formatDate(current.endDate)}</p>
              <p className="text-[#616b8e]">
                Auto renew: {current.autoRenew ? "Ha" : "Yo'q"}
              </p>
            </div>
          )}
        </article>

        <article className="panel-surface p-4">
          <h3 className="mb-3 text-base font-semibold text-[#2f3655]">Yangi tarif rejasi</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              className="soft-input h-11"
              placeholder="Reja nomi"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              className="soft-input h-11"
              type="number"
              placeholder="Narx"
              value={draft.price}
              onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
            />
            <Input
              className="soft-input h-11"
              type="number"
              placeholder="Davomiylik (kun)"
              value={draft.durationDays}
              onChange={(event) => setDraft((prev) => ({ ...prev, durationDays: event.target.value }))}
            />
            <Input
              className="soft-input h-11"
              type="number"
              placeholder="O'quvchi limiti"
              value={draft.studentLimit}
              onChange={(event) => setDraft((prev) => ({ ...prev, studentLimit: event.target.value }))}
            />
            <Input
              className="soft-input h-11"
              type="number"
              placeholder="Filial limiti"
              value={draft.branchLimit}
              onChange={(event) => setDraft((prev) => ({ ...prev, branchLimit: event.target.value }))}
            />
            <Textarea
              className="soft-input min-h-24 md:col-span-2"
              placeholder='Features (JSON yoki text): {"sms":true,"maxGroups":20}'
              value={draft.features}
              onChange={(event) => setDraft((prev) => ({ ...prev, features: event.target.value }))}
            />
          </div>
          <GradientButton className="mt-3 h-11" onClick={createPlan}>
            <Plus className="mr-1 h-4 w-4" />
            Tarif yaratish
          </GradientButton>
        </article>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#5b64df]" />
          <h3 className="text-lg font-semibold text-[#2f3655]">Tarif planlari</h3>
          <Badge className="rounded-lg bg-[#ecf0ff] text-[#4f5ed9]">{plans.length}</Badge>
        </div>

        {!plans.length ? (
          <div className="panel-surface px-4 py-16 text-center text-[#8b95b3]">
            Tarif planlari topilmadi
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className="panel-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-[#2f3655]">{plan.name}</h4>
                  <Badge variant="outline">{plan.status}</Badge>
                </div>
                <p className="text-2xl font-bold text-[#4757d6]">{formatCurrency(plan.price)}</p>
                <div className="mt-2 space-y-1 text-sm text-[#616b8e]">
                  <p>Davomiyligi: {plan.durationDays} kun</p>
                  <p>O'quvchi limiti: {plan.studentLimit}</p>
                  <p>Filial limiti: {plan.branchLimit}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

