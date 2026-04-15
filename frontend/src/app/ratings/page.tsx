"use client";

import { ApiListPage } from "@/components/modules/api-list-page";
import { ratingsApi } from "@/lib/api/services";

export default function RatingsPage() {
  return (
    <ApiListPage
      title="Reytinglar"
      description="Ratings panel ro'yxati"
      endpointLabel="GET /ratings"
      fetcher={(params) => ratingsApi.list(params)}
    />
  );
}
