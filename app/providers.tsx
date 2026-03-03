"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { cronosTestnet, polygonMumbai } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HyperGateProvider } from "@hyper-gate/react";
import { getDefaultConfig as getDefaultHGConfig } from "@hyper-gate/connectkit";
import {
  XummConnector,
  GemConnector,
  createConfig as createHGConfig,
} from "@hyper-gate/core";

import { type Chain } from "viem";

export const xrplMainnetWagmi = {
  id: 0,
  name: "XRPL Mainnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://s1.ripple.com:51234"] },
    public: { http: ["https://s1.ripple.com:51234"] },
  },
  blockExplorers: {
    default: { name: "XRPScan", url: "https://xrpscan.com" },
  },
} as const satisfies Chain;
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { getDefaultConfig } from "connectkit";
import { HyperConnectSync } from "./sync";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [cronosTestnet, xrplMainnetWagmi],
    transports: {
      // RPC URL for each chain
      [polygonMumbai.id]: http("https://rpc.ankr.com/polygon_mumbai"),
      [cronosTestnet.id]: http(),
      [xrplMainnetWagmi.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",

    // Required App Info
    appName: "Secur·d",

    // Optional App Info
    appDescription: "Secur·d Liquidity Backed Lending protocol",
    appUrl: "https://securd.org", // your app's url
    appIcon: "https://securd.org/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)

    ssr: true,
  }),
);

const hgconfig = createHGConfig(
  getDefaultHGConfig({
    appName: "HyperGate Demo",
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
      <WagmiProvider config={config}>
        <HyperGateProvider config={hgconfig}>
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
