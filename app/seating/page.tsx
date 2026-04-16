"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SeatingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/halls");
  }, [router]);

  return null;
}
