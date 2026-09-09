"use client";

import { TextileTabs } from "@/components/TextileTabs";

export function TextileChrome() {
  return (
    <div className="sticky top-16 z-20 sm:top-[4.5rem]">
      <div className="w-full pt-2.5">
        <TextileTabs />
      </div>
    </div>
  );
}
