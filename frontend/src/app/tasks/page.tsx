"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/attendance");
  }, [router]);

  return (
    <div className="soft-page min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-[#4c62df] border-t-transparent animate-spin" />
    </div>
  );
}
