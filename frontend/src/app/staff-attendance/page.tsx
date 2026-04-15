"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import { staffAttendanceApi } from "@/lib/api/services";
import { AttendanceStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils-helpers";

type StaffAttendanceRow = {
  id: string;
  date: string;
  attendanceStatus: AttendanceStatus;
  note?: string | null;
  staff?: {
    id: string;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

type StaffAttendanceStats = {
  total: number;
  breakdown: Array<{ status: AttendanceStatus; count: number }>;
};

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[#e8f8ef] text-[#1e9d5f] border-[#bdeacc]",
  ABSENT: "bg-[#ffedf1] text-[#d54f6f] border-[#f3c0ce]",
  LATE: "bg-[#fff7e8] text-[#d38c25] border-[#f0d7a9]",
  EXCUSED: "bg-[#f0edff] text-[#6552d8] border-[#cfc7ff]",
};

function toFullName(row: StaffAttendanceRow) {
  const firstName = row.staff?.user?.firstName ?? "";
  const lastName = row.staff?.user?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || row.staff?.id || "-";
}

export default function StaffAttendancePage() {
  const [records, setRecords] = useState<StaffAttendanceRow[]>([]);
  const [stats, setStats] = useState<StaffAttendanceStats>({ total: 0, breakdown: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");

  const breakdownMap = useMemo(() => {
    return ATTENDANCE_OPTIONS.reduce<Record<AttendanceStatus, number>>(
      (acc, item) => {
        acc[item] = stats.breakdown.find((x) => x.status === item)?.count ?? 0;
        return acc;
      },
      { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 },
    );
  }, [stats.breakdown]);

  async function loadData() {
    try {
      setLoading(true);
      const [listResponse, statsResponse] = await Promise.all([
        staffAttendanceApi.list({
          page: 1,
          limit: 100,
          search: search || undefined,
          attendanceStatus: status === "ALL" ? undefined : status,
        }),
        staffAttendanceApi.stats({
          attendanceStatus: status === "ALL" ? undefined : status,
        }),
      ]);

      const data = (listResponse.data as StaffAttendanceRow[]) ?? [];
      const filtered = search
        ? data.filter((item) =>
            `${toFullName(item)} ${item.staff?.user?.phone ?? ""} ${item.staff?.user?.email ?? ""}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : data;

      setRecords(filtered);
      setStats((statsResponse as { data?: StaffAttendanceStats }).data ?? (statsResponse as StaffAttendanceStats));
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Xodimlar davomatini yuklashda xatolik",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <DashboardLayout
      title="Xodimlar davomati"
      description="Xodimlar davomatini nazorat qilish va tahlil"
    >
      <section className="rounded-3xl border border-[#dbe2f4] bg-[#edf1fb] px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#4b58d1]" />
          <h1 className="text-2xl font-bold text-[#2d3558]">Xodimlar davomati</h1>
        </div>
        <p className="text-sm text-[#6f7ca2]">Xodimlar davomati ro'yxati va holat statistikasi</p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ATTENDANCE_OPTIONS.map((item) => (
          <article key={item} className={`rounded-2xl border px-4 py-3 ${STATUS_STYLE[item]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">{item}</p>
            <p className="mt-1 text-2xl font-semibold">{breakdownMap[item]}</p>
          </article>
        ))}
      </section>

      <section className="panel-surface p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c95ad]" />
            <Input
              className="soft-input h-11 pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="O'qituvchi yoki telefon bo'yicha qidiring..."
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value ?? "ALL")}>
            <SelectTrigger className="soft-input h-11 w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barchasi</SelectItem>
              {ATTENDANCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-[#e3e8f4]"
            onClick={loadData}
            disabled={loading}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filterlash
          </Button>
        </div>

        {!records.length ? (
          <div className="rounded-2xl border border-[#e5ebf7] bg-[#fbfcff] px-4 py-16 text-center">
            <p className="text-lg font-semibold text-[#2e3655]">Yozuvlar topilmadi</p>
            <p className="text-sm text-[#8b95b3]">Tanlangan filter bo'yicha natija yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#edf1fb]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f6f8fe] text-xs uppercase tracking-[0.11em] text-[#8e98b7]">
                <tr>
                  <th className="px-4 py-3 text-left">Xodim</th>
                  <th className="px-4 py-3 text-left">Aloqa</th>
                  <th className="px-4 py-3 text-left">Holat</th>
                  <th className="px-4 py-3 text-left">Sana</th>
                  <th className="px-4 py-3 text-left">Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1fb] bg-white">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-[#2f3655]">{toFullName(record)}</td>
                    <td className="px-4 py-3 text-[#616b8e]">
                      {record.staff?.user?.phone ?? record.staff?.user?.email ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{record.attendanceStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#616b8e]">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-[#616b8e]">{record.note ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
