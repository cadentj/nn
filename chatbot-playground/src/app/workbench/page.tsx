"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkbenchPage() {
  const router = useRouter();

  // Redirect to playground
  useEffect(() => {
    router.replace("/playground");
  }, [router]);

  return <div className="flex items-center justify-center h-screen">Redirecting...</div>;
}
