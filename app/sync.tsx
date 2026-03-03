"use client";

import { mock, useConnect, useDisconnect } from "wagmi";
import { useAccountEffect } from "@hyper-gate/react";
import { ConnectKitProvider } from "@hyper-gate/connectkit";
import { FamilyAccountsSdk } from "family";
import { useEffect } from "react";

export const HyperConnectSync = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    FamilyAccountsSdk.connect();
  }, []);

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
