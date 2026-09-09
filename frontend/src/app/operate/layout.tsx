import { OperateChrome } from "@/components/OperateChrome";

export default function OperateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <OperateChrome />
      {children}
    </div>
  );
}
