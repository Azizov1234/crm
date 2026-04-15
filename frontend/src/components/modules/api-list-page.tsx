"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { Database, Filter, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmptyState, PageHero, SearchToolbar } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import type { QueryParams } from "@/lib/api/services";

type ApiListResponse = {
  data: unknown[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

function normalizeResponse(input: unknown): ApiListResponse {
  if (Array.isArray(input)) return { data: input };
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const data = Array.isArray(obj.data) ? obj.data : input ? [input] : [];
    const meta =
      obj.meta && typeof obj.meta === "object"
        ? (obj.meta as ApiListResponse["meta"])
        : undefined;
    return { data, meta };
  }
  return { data: [] };
}

type ApiListPageProps = {
  title: string;
  description: string;
  endpointLabel: string;
  fetcher: (params: QueryParams) => Promise<unknown>;
  includeSearch?: boolean;
};

export function ApiListPage({
  title,
  description,
  endpointLabel,
  fetcher,
  includeSearch = true,
}: ApiListPageProps) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<unknown[]>([]);
  const [meta, setMeta] = useState<ApiListResponse["meta"]>();

  const query = useMemo<QueryParams>(
    () => ({
      page: 1,
      limit: 50,
      search: includeSearch ? search || undefined : undefined,
    }),
    [includeSearch, search],
  );

  async function loadData() {
    try {
      setLoading(true);
      const response = await fetcher(query);
      const normalized = normalizeResponse(response);
      setRows(normalized.data);
      setMeta(normalized.meta);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : `${title} ma'lumotlarini olishda xatolik`,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.limit, query.search]);

  return (
    <DashboardLayout title={title} description={description}>
      <PageHero
        title={title}
        subtitle={description}
        icon={Database}
        statLabel="Jami yozuvlar"
        statValue={meta?.total ?? rows.length}
      />

      <SearchToolbar
        value={search}
        onChange={setSearch}
        placeholder={`${title} ichidan qidiring...`}
        actions={
          <>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-[#e3e8f4] bg-white"
              onClick={loadData}
              disabled={loading}
            >
              <Filter className="mr-1 h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-[#e3e8f4] bg-white"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCcw className="mr-1 h-4 w-4" />
              Yangilash
            </Button>
          </>
        }
      />

      <section className="panel-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#edf1fb] bg-[#f7f9ff] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8f99b7]">
            Endpoint
          </p>
          <Badge className="rounded-lg bg-[#ecf0ff] text-[#4f5ed9]">{endpointLabel}</Badge>
        </div>

        {!rows.length ? (
          <EmptyState
            title={`${title} topilmadi`}
            subtitle="Filterlarni tekshirib qayta urinib ko'ring."
            className="min-h-56 border-none shadow-none"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f6f8fe] text-xs uppercase tracking-[0.11em] text-[#8e98b7]">
                <tr>
                  <th className="w-72 px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Ma'lumot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1fb] bg-white">
                {rows.map((row, index) => {
                  const item = row as Record<string, unknown>;
                  const id =
                    (typeof item?.id === "string" ? item.id : null) ??
                    `row-${index + 1}`;
                  return (
                    <tr key={String(id)}>
                      <td className="px-4 py-3 font-mono text-xs text-[#5f6888]">
                        {String(id)}
                      </td>
                      <td className="px-4 py-3">
                        <pre className="whitespace-pre-wrap break-all rounded-xl border border-[#edf1fb] bg-[#fbfcff] p-3 text-xs text-[#5f6888]">
                          {JSON.stringify(row, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

