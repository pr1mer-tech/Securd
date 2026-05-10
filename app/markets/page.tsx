import { AccountSummary } from "@/components/markets/AccountSummary";
import { SupplyMarketsTable } from "@/components/markets/SupplyMarketsTable";
import { BorrowMarketsTable } from "@/components/markets/BorrowMarketsTable";

export const metadata = {
  title: "Secur·d — Markets",
  description: "Supply and borrow assets on Securd lending protocol on XRPL.",
};

export default function MarketsPage() {
  return (
    <>
      {/* Account summary — teal hero section */}
      <AccountSummary />

      {/* Market tables */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6">
        <SupplyMarketsTable />
        <BorrowMarketsTable />
      </div>
    </>
  );
}
