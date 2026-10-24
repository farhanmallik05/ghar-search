"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function EntryAnimation({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const fromLanding = params.get("from") === "landing";

  if (!fromLanding) {
    return <>{children}</>;
  }

  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
}

export default function PageEntryTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <EntryAnimation>{children}</EntryAnimation>
    </Suspense>
  );
}
