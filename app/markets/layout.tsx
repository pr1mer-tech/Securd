import { ContractDataSync } from "@/components/markets/ContractDataSync";

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-securdBlack">
      <ContractDataSync />
      {children}
    </div>
  );
}
