"use client";

import { ApiListPage } from "@/components/modules/api-list-page";
import { actionLogsApi } from "@/lib/api/services";

export default function ActionLogsPage() {
  return (
    <ApiListPage
      title="Action loglar"
      description="Action logs panel"
      endpointLabel="GET /action-logs"
      fetcher={(params) => actionLogsApi.list(params)}
    />
  );
}
