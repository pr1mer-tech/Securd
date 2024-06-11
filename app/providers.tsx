"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { cronosTestnet, polygonMumbai } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const config = createConfig(
	getDefaultConfig({
		// Your dApps chains
		chains: [cronosTestnet],
		transports: {
			// RPC URL for each chain
			[polygonMumbai.id]: http("https://rpc.ankr.com/polygon_mumbai"),
			[cronosTestnet.id]: http(),
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

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<TooltipProvider>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<ConnectKitProvider>
						{children}
						<Toaster />
					</ConnectKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</TooltipProvider>
	);
};
