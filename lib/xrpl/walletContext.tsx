"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// Type-only import — erased at compile time, never reaches the runtime module
// graph. The actual `xrpl-connect` runtime (which touches `window`) is loaded
// via dynamic `import()` inside the client-only effect below.
import type { WalletManager } from "xrpl-connect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IS_MAINNET } from "@/lib/constants/network";

type AccountInfo = { address: string; publicKey?: string };

type AvailableWallet = { id: string; name: string; icon?: string };

type WalletCtx = {
  manager: WalletManager | null;
  account: AccountInfo | null;
  connected: boolean;
  connect: (adapterId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  openPicker: () => void;
  closePicker: () => void;
};

const Ctx = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<WalletManager | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [isPickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let activeManager: WalletManager | null = null;
    let sync: (() => void) | null = null;

    (async () => {
      const xc = await import("xrpl-connect");
      if (cancelled) return;

      const m = new xc.WalletManager({
        network: IS_MAINNET ? "mainnet" : "testnet",
        autoConnect: true,
        adapters: [
          new xc.XamanAdapter({ apiKey: process.env.NEXT_PUBLIC_XUMM_API_KEY ?? "" }),
          new xc.CrossmarkAdapter(),
          new xc.GemWalletAdapter(),
          new xc.WalletConnectAdapter({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
          }),
        ],
      });

      activeManager = m;
      sync = () => {
        setAccount(m.account ?? null);
        setConnected(m.connected);
        if (m.connected) setPickerOpen(false);
      };
      sync();
      m.on("connect", sync);
      m.on("disconnect", sync);

      setManager(m);
    })();

    return () => {
      cancelled = true;
      if (activeManager && sync) {
        activeManager.off("connect", sync);
        activeManager.off("disconnect", sync);
      }
    };
  }, []);

  const connect = useCallback(
    async (adapterId: string) => {
      if (!manager) throw new Error("Wallet manager not ready yet");
      await manager.connect(adapterId);
    },
    [manager],
  );

  const disconnect = useCallback(async () => {
    if (!manager) return;
    await manager.disconnect();
  }, [manager]);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const value = useMemo<WalletCtx>(
    () => ({ manager, account, connected, connect, disconnect, openPicker, closePicker }),
    [manager, account, connected, connect, disconnect, openPicker, closePicker],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <WalletPickerModal isOpen={isPickerOpen} />
    </Ctx.Provider>
  );
}

export function useWallet() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWallet must be used inside <WalletProvider>");
  return v;
}

// Convenience shim — returns { address } so call sites that only need the
// connected XRPL address can use this instead of destructuring useWallet.
export function useAccount() {
  const { account } = useWallet();
  return { address: account?.address };
}

// ─── Picker modal ─────────────────────────────────────────────────────────────

function WalletPickerModal({ isOpen }: { isOpen: boolean }) {
  const { manager, connect, closePicker } = useWallet();
  const [available, setAvailable] = useState<AvailableWallet[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !manager) return;
    setError(null);
    manager
      .getAvailableWallets()
      .then((list: AvailableWallet[]) => setAvailable(list))
      .catch((err: unknown) => {
        console.error("getAvailableWallets failed", err);
        setAvailable([]);
      });
  }, [isOpen, manager]);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    setError(null);
    try {
      await connect(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePicker()}>
      <DialogContent className="bg-[#1a1d20] border border-white/10 text-securdWhite max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="font-poppins">Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-2">
          {!manager ? (
            <p className="text-securdGrey text-sm text-center py-4">
              Initializing wallets…
            </p>
          ) : available.length === 0 ? (
            <p className="text-securdGrey text-sm text-center py-4">
              No XRPL wallets detected.
            </p>
          ) : (
            available.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                disabled={connecting !== null}
                onClick={() => handleConnect(wallet.id)}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-3">
                  {wallet.icon && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={wallet.icon}
                      alt=""
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <span className="font-medium text-sm">{wallet.name}</span>
                </span>
                {connecting === wallet.id && (
                  <span className="text-xs text-securdGrey">Connecting…</span>
                )}
              </button>
            ))
          )}
          {error && (
            <p className="text-systemRed text-xs text-center pt-2">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
