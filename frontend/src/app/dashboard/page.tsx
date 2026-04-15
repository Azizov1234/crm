"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  UserPlus,
  Users,
  TrendingUp,
  Trophy,
  CalendarCheck,
  User,
  UserX,
  ArrowUpRight,
  DollarSign,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHero } from "@/components/shared/page-hero";
import { dashboardApi } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";
import { DashboardOverview } from "@/lib/types";
import { formatCurrency } from "@/lib/utils-helpers";

type GenderStat = { gender: string | null; count: number };
type AttendanceStat = { status: string; count: number };
type IncomeStat = { month: string; amount: number };
type TopStudent = { fullName: string; avgScore: number; ratingCount: number };

// ─── Stat cards config ────────────────────────────────────────────────────────
const STAT_CARD_COLORS: Array<{
  bg: string;
  iconBg: string;
  iconColor: string;
}> = [
  { bg: "#ffffff", iconBg: "#eef1ff", iconColor: "#5058e8" },
  { bg: "#ffffff", iconBg: "#e8f3ff", iconColor: "#2060d8" },
  { bg: "#ffffff", iconBg: "#e6f8ee", iconColor: "#1a9a5a" },
  { bg: "#ffffff", iconBg: "#fff3e6", iconColor: "#d87820" },
  { bg: "#ffffff", iconBg: "#fde8ee", iconColor: "#c82848" },
  { bg: "#ffffff", iconBg: "#ede8ff", iconColor: "#7838d8" },
];

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [genderStats, setGenderStats] = useState<GenderStat[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStat[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<IncomeStat[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [overviewData, genderData, incomeData, attendanceData, topData] =
          await Promise.all([
            dashboardApi.overview(),
            dashboardApi.genderStats(),
            dashboardApi.monthlyIncome(),
            dashboardApi.attendanceStats(),
            dashboardApi.topStudents(),
          ]);

        setOverview(overviewData);
        setGenderStats(genderData);
        setMonthlyIncome(incomeData);
        setAttendanceStats(attendanceData);
        setTopStudents(topData);
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Dashboard ma'lumotlarini olishda xatolik",
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const lastMonthIncome = useMemo(() => {
    if (!monthlyIncome.length) return 0;
    return monthlyIncome[monthlyIncome.length - 1]?.amount ?? 0;
  }, [monthlyIncome]);

  const totalIncome = useMemo(
    () => monthlyIncome.reduce((s, x) => s + x.amount, 0),
    [monthlyIncome],
  );

  const statCards = [
    {
      title: "Jami O'quvchilar",
      value: overview?.totalStudents ?? 0,
      icon: Users,
      ...STAT_CARD_COLORS[0],
    },
    {
      title: "Jami Guruhlar",
      value: overview?.totalGroups ?? 0,
      icon: School,
      ...STAT_CARD_COLORS[1],
    },
    {
      title: "O'qituvchilar",
      value: overview?.totalTeachers ?? 0,
      icon: GraduationCap,
      ...STAT_CARD_COLORS[2],
    },
    {
      title: "Faol Kurslar",
      value: overview?.activeCourses ?? 0,
      icon: BookOpen,
      ...STAT_CARD_COLORS[3],
    },
    {
      title: "Yangi Ro'yxatdan O'tganlar",
      value: overview?.newRegistered ?? 0,
      icon: UserPlus,
      ...STAT_CARD_COLORS[4],
    },
    {
      title: "Tushum",
      value: formatCurrency(overview?.income ?? 0),
      icon: DollarSign,
      ...STAT_CARD_COLORS[5],
    },
  ];

  return (
    <DashboardLayout
      title="Bosh sahifa"
      description="Tashkilotingiz haqida umumiy ma'lumot"
    >
      {/* Hero */}
      <PageHero
        title="Bosh sahifa"
        subtitle="Tashkilotingiz haqida umumiy ma'lumot"
        icon={LayoutDashboard}
        statLabel="Jami O'quvchilar"
        statValue={overview?.totalStudents ?? 0}
      />

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              style={{
                background: "#ffffff",
                border: "1px solid #e4e9f5",
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 10px -4px rgba(30,50,120,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 24px -8px rgba(30,50,120,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 2px 10px -4px rgba(30,50,120,0.08)";
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#8898c0",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  {card.title}
                </p>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#1e2340",
                    margin: "4px 0 0",
                    lineHeight: 1,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                  }}
                >
                  {loading ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 60,
                        height: 24,
                        borderRadius: 6,
                        background: "linear-gradient(90deg, #e8edf8 25%, #f2f5fc 50%, #e8edf8 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.4s infinite",
                      }}
                    />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: card.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 22, height: 22, color: card.iconColor }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions bar */}
      <div
        style={{
          background: "linear-gradient(98deg, #2f66f4 0%, #4356e8 45%, #8342ef 100%)",
          borderRadius: 16,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxShadow: "0 6px 20px -8px rgba(63,86,210,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TrendingUp style={{ width: 18, height: 18, color: "rgba(255,255,255,0.85)" }} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#ffffff" }}>Tezkor Amallar</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "O'quvchi Qo'shish", href: "/students", icon: UserPlus },
            { label: "Yangi Kurs", href: "/courses", icon: BookOpen },
            { label: "Yangi Jadval", href: "/timetable", icon: CalendarCheck },
          ].map((btn) => {
            const BtnIcon = btn.icon;
            return (
              <a
                key={btn.href}
                href={btn.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.24)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)";
                }}
              >
                <BtnIcon style={{ width: 15, height: 15 }} />
                {btn.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Main content row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>

        {/* Left: Attendance chart */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e9f5",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 2px 10px -4px rgba(30,50,120,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarCheck style={{ width: 17, height: 17, color: "#5f6edc" }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e2340", margin: 0 }}>
                Davomat
              </h3>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "Kelganlar", color: "#22c484" },
                { label: "Kelmaganlar", color: "#e04060" },
                { label: "Kechikkanlar", color: "#f0a830" },
                { label: "Sababli", color: "#9b59de" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 11.5, color: "#8898c0" }}>{item.label}:</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance stats */}
          {!attendanceStats.length ? (
            <div
              style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a0aec8",
                fontSize: 13,
              }}
            >
              Ma&apos;lumot topilmadi
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {attendanceStats.map((item) => (
                <div
                  key={item.status}
                  style={{
                    background: "#f7f9ff",
                    border: "1px solid #edf1fb",
                    borderRadius: 12,
                    padding: "10px 14px",
                  }}
                >
                  <p style={{ fontSize: 11.5, color: "#8898c0", margin: 0 }}>{item.status}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "#1e2340", margin: "2px 0 0" }}>
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Gender + Top students */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Gender card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e9f5",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 2px 10px -4px rgba(30,50,120,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <User style={{ width: 17, height: 17, color: "#5f6edc" }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e2340", margin: 0 }}>
                Jins Taqsimoti
              </h3>
            </div>

            {!genderStats.length ? (
              <p style={{ fontSize: 13, color: "#8898c0" }}>Ma&apos;lumot topilmadi</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {genderStats.map((item) => {
                  const total = genderStats.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const isMale =
                    item.gender === "MALE" || item.gender?.toLowerCase().includes("o");
                  return (
                    <div key={item.gender ?? "UNKNOWN"}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#3a4470" }}>
                          {isMale ? "O'g'il bolalar" : "Qiz bolalar"}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#4158ca" }}>
                          {item.count}{" "}
                          <span style={{ fontWeight: 400, color: "#8898c0" }}>({pct}%)</span>
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          borderRadius: 9999,
                          background: "#eef2ff",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 9999,
                            background: isMale
                              ? "linear-gradient(90deg, #4158ca, #6278e8)"
                              : "linear-gradient(90deg, #e05080, #c02060)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid #edf1fb",
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "#8898c0" }}>Jami O&apos;quvchilar</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#4158ca" }}>
                    {genderStats.reduce((s, x) => s + x.count, 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Top students */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e9f5",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 2px 10px -4px rgba(30,50,120,0.08)",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Trophy style={{ width: 17, height: 17, color: "#f0a830" }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e2340", margin: 0 }}>
                Eng Yaxshi Natijalar
              </h3>
            </div>

            {!topStudents.length ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px 0",
                  gap: 8,
                }}
              >
                <UserX style={{ width: 32, height: 32, color: "#c4cce8" }} />
                <p style={{ fontSize: 12.5, color: "#a0aec8", textAlign: "center", margin: 0 }}>
                  Hozircha natijalar yo&apos;q
                </p>
                <p style={{ fontSize: 11.5, color: "#b8c2d8", textAlign: "center", margin: 0 }}>
                  Reytinglar baholanganda paydo bo&apos;ladi.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {topStudents.slice(0, 5).map((item, i) => (
                  <div
                    key={`${item.fullName}-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: 10,
                      background: "#f7f9ff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background:
                            i === 0
                              ? "linear-gradient(135deg, #f0a830, #e07820)"
                              : i === 1
                                ? "linear-gradient(135deg, #8898c0, #6878a0)"
                                : i === 2
                                  ? "linear-gradient(135deg, #c08060, #a06040)"
                                  : "#eef2ff",
                          color: i < 3 ? "#fff" : "#6878b0",
                          fontSize: 10,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#1e2340",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.fullName}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#4158ca",
                        background: "#eef2ff",
                        padding: "2px 8px",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    >
                      {item.avgScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly income */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e4e9f5",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 2px 10px -4px rgba(30,50,120,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard style={{ width: 17, height: 17, color: "#5f6edc" }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e2340", margin: 0 }}>
              Oylik Tushum (So&apos;nggi 6 oy)
            </h3>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10.5, color: "#8898c0", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Jami
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#4158ca", margin: 0 }}>
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        {!monthlyIncome.length ? (
          <p style={{ fontSize: 13, color: "#8898c0" }}>Ma&apos;lumot topilmadi</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthlyIncome.slice(-6).map((item) => {
              const maxAmt = Math.max(...monthlyIncome.map((x) => x.amount));
              const pct = maxAmt > 0 ? (item.amount / maxAmt) * 100 : 0;
              return (
                <div
                  key={item.month}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    background: "#f7f9ff",
                    borderRadius: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "#5a6688",
                      minWidth: 80,
                      flexShrink: 0,
                    }}
                  >
                    {item.month}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 9999,
                      background: "#edf1fb",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 9999,
                        background: "linear-gradient(90deg, #4158ca, #7e54dd)",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1e2340",
                      minWidth: 110,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </span>
                  <ArrowUpRight style={{ width: 14, height: 14, color: "#8898c0", flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
