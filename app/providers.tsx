"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import { useEffect } from "react";
import { useSaveStore } from "@/lib/data/saveStore";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";

const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [polygonMumbai],
        transports: {
            // RPC URL for each chain
            [polygonMumbai.id]: http(
                // `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
                `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API_KEY_ALCHEMY}`
            ),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

        // Required App Info
        appName: "Your App Name",

        // Optional App Info
        appDescription: "Your App Description",
        appUrl: "https://family.co", // your app's url
        appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
);

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <TooltipProvider>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <ConnectKitProvider>{children}</ConnectKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </TooltipProvider>
    );
};