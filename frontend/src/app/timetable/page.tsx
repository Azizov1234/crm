"use client";

import { ApiListPage } from "@/components/modules/api-list-page";
import { timetableApi } from "@/lib/api/services";

export default function TimetablePage() {
  return (
    <ApiListPage
      title="Jadval"
      description="Timetable panel ro'yxati"
      endpointLabel="GET /timetable"
      fetcher={(params) => timetableApi.list(params)}
    />
  );
}
