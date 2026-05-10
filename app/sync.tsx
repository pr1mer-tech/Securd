"use client";

import { mock, useConnect, useDisconnect } from "wagmi";
import { useAccountEffect } from "@hyper-gate/react";
import { ConnectKitProvider } from "@hyper-gate/connectkit";

export const HyperConnectSync = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  useAccountEffect({
    onConnect: (data) => {
      connect({
        connector: mock({
          accounts: [data.address as `0x${string}`],
        }),
        chainId: data.chainId,
      });
    },
    onDisconnect: () => {
      disconnect();
    },
  });
  return <ConnectKitProvider>{children}</ConnectKitProvider>;
};
