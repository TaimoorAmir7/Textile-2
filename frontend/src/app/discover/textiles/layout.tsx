import Link from "next/link";
import { TextileTabs } from "@/components/TextileTabs";

export default function TextilesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="sticky top-14 z-20 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto max-w-[1600px] px-5 pt-2.5">
          <div className="font-data-mono mb-1.5 flex items-center gap-1 text-outline">
            <Link href="/discover" className="hover:text-primary">
              Discover
            </Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="font-bold text-primary">Textiles &amp; Apparel</span>
          </div>
          <TextileTabs />
        </div>
      </div>
      <div className="mx-auto max-w-[1600px]">{children}</div>
    </div>
  );
}
