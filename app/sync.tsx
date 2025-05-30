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
		onConnect: () => {
			connect({
				connector: mock({
					accounts: ["0x492804D7740150378BE8d4bBF8ce012C5497DeA9"],
				}),
			});
		},
		onDisconnect: () => {
			disconnect();
		},
	});
	return <ConnectKitProvider>{children}</ConnectKitProvider>;
};
