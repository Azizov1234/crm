"use client";

import { ApiListPage } from "@/components/modules/api-list-page";
import { branchesApi } from "@/lib/api/services";

export default function BranchesPage() {
  return (
    <ApiListPage
      title="Filiallar"
      description="Branch panel ro'yxati"
      endpointLabel="GET /branches"
      fetcher={(params) => branchesApi.list(params)}
    />
  );
}
