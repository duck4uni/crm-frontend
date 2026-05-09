import { FinanceTabs } from "./components/FinanceTabs";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <FinanceTabs />
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
