"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { WalletProvider } from "@/lib/xrpl/walletContext";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </QueryClientProvider>
    </TooltipProvider>
  );
};
