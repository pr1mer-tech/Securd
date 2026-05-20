// Ambient module declaration for `xrpl-connect` — the published package
// (v0.7.1) ships without bundled .d.ts files. Type the public surface we
// actually use; the rest is left as `any` so calls compile.

declare module "xrpl-connect" {
  export type Account = {
    address: string;
    publicKey?: string;
    network?: { id?: string | number; name?: string };
  };

  export type AvailableWallet = {
    id: string;
    name: string;
    icon?: string;
  };

  export type SignAndSubmitResult = {
    hash: string;
    [key: string]: unknown;
  };

  export type WalletManagerConfig = {
    adapters: unknown[];
    network: "mainnet" | "testnet" | "devnet";
    autoConnect?: boolean;
    logger?: unknown;
  };

  export class WalletManager {
    constructor(config: WalletManagerConfig);
    readonly account: Account | null;
    readonly connected: boolean;
    readonly wallet: { id: string; name: string } | null;
    connect(adapterId: string, options?: unknown): Promise<Account>;
    disconnect(): Promise<void>;
    sign(transaction: unknown): Promise<unknown>;
    signAndSubmit(transaction: unknown): Promise<SignAndSubmitResult>;
    signMessage(message: string): Promise<unknown>;
    getAvailableWallets(): Promise<AvailableWallet[]>;
    on(event: string, listener: (...args: unknown[]) => void): void;
    off(event: string, listener: (...args: unknown[]) => void): void;
    once(event: string, listener: (...args: unknown[]) => void): void;
  }

  export class XamanAdapter {
    constructor(options: { apiKey: string; onQRCode?: (uri: string) => void });
  }
  export class CrossmarkAdapter {
    constructor();
  }
  export class GemWalletAdapter {
    constructor();
  }
  export class WalletConnectAdapter {
    constructor(options: { projectId: string; onQRCode?: (uri: string) => void });
  }
  export class LedgerAdapter {
    constructor();
  }
}
