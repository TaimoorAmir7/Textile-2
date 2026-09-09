import { TextileChrome } from "@/components/TextileChrome";

export default function TextilesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TextileChrome />
      <div className="w-full">{children}</div>
    </div>
  );
}
