"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HyperGateProvider } from "@hyper-gate/react";
import { getDefaultConfig as getDefaultHGConfig } from "@hyper-gate/connectkit";
import {
  XummConnector,
  GemConnector,
  createConfig as createHGConfig,
} from "@hyper-gate/core";
import { getDefaultConfig } from "connectkit";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { HyperConnectSync } from "./sync";
import { xrplEvmTestnet } from "@/lib/constants/xrplEvmChain";

// Minimal wagmi config — XRPL EVM chain is read via standalone publicClient.
// Wagmi is kept only for HyperGate's useConnect/useDisconnect hooks.
const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [xrplEvmTestnet],
    transports: {
      [xrplEvmTestnet.id]: http("https://rpc.testnet.xrplevm.org"),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    appName: "Secur·d",
    appDescription: "Secur·d lending protocol on XRPL",
    appUrl: "https://securd.org",
    appIcon: "https://securd.org/logo.png",
    ssr: true,
  }),
);

const hgConfig = createHGConfig(
  getDefaultHGConfig({
    appName: "Secur·d",
    connectors: [
      new XummConnector(process.env.NEXT_PUBLIC_XUMM_API_KEY ?? ""),
      new GemConnector(),
    ],
  }),
);

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <WagmiProvider config={wagmiConfig}>
        <HyperGateProvider config={hgConfig}>
          <QueryClientProvider client={queryClient}>
            <HyperConnectSync>
              {children}
              <Toaster />
            </HyperConnectSync>
          </QueryClientProvider>
        </HyperGateProvider>
      </WagmiProvider>
    </TooltipProvider>
  );
};
