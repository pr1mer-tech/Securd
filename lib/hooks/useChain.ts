import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";

export default function useChainURL(chainId: string | undefined) {
  const [hydrated, setHydrated] = useState(false);
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const searchParams = useSearchParams();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) return;
    if (typeof chain === "undefined") return;
    if (chainId !== chain.id.toString()) {
      switchChain({ chainId: Number(chainId) });
    }

    setHydrated(true);
  }, [hydrated, chainId, chain, switchChain]);

  useEffect(() => {
    if (!hydrated) return;

    const currentChainParam = searchParams.get("chain");
    const expectedChainId = chain?.id.toString();

    if (expectedChainId && currentChainParam !== expectedChainId) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("chain", expectedChainId);

      router.replace(`${path}?${newParams.toString()}`, {
        scroll: false,
      });
    }
  }, [chain, hydrated, path, router, searchParams]);
}
