"use client";

import { usePathname } from "next/navigation";
import { isSubPage } from "@/components/PageTrail";
import { OperateTabs } from "@/components/OperateTabs";

export function OperateChrome() {
  const pathname = usePathname();
  if (isSubPage(pathname)) return null;

  return (
    <div className="sticky top-16 z-20 sm:top-[4.5rem]">
      <div className="w-full pt-2.5">
        <OperateTabs />
      </div>
    </div>
  );
}
