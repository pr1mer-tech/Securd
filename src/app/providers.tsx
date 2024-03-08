"use client";
import React, { FC, ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { main } from "./styles/theme.styled";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "@/utils/constants";
import axios from "axios";
import MainProvider from "@/context/Main.context";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai } from "viem/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

type Props = {
  children: ReactNode;
};

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Providers: FC<Props> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        networkMode: "online",
        refetchInterval: REFETCH_INTERVAL,
        retry: 3,
      },
    },
  });

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [polygonMumbai],
    [
      alchemyProvider({
        apiKey: process.env.NEXT_PUBLIC_API_KEY_ALCHEMY || "",
      }),
      publicProvider(),
    ]
  );

  const config = createConfig({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: "Securd",
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  });

  return (
    <ThemeProvider theme={main}>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <MainProvider>{children}</MainProvider>
          <ToastContainer />
        </QueryClientProvider>
      </WagmiConfig>
    </ThemeProvider>
  );
};

export default Providers;
