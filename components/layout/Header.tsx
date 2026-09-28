"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SecurdLogo from "@/assets/logos/securd-logo.svg";
import { usePathname, useRouter } from "next/navigation";
import { ActiveTab } from "@/lib/types/enums";
import { useWallet } from "@/lib/xrpl/walletContext";
import { MenuIcon, XIcon, Wallet, Copy, ExternalLink, LogOut, ChevronDown, ArrowLeftRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getProxyAddress } from "@/lib/utils/xrplProxy";
import {
  EXPLORER_XRPL_EVM,
  EXPLORER_XRPL_LEDGER,
  AXELARSCAN_URL,
} from "@/lib/constants/network";
import { type Address } from "viem";

const NAV = [
  { label: "Markets", href: "/markets", tab: ActiveTab.MARKETS },
];

const Header = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.MARKETS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setActiveTab(ActiveTab.MARKETS);
  }, [pathname]);

  return (
    <div className="relative z-50 bg-securdBlack">
      <div className="flex items-center justify-between px-6 lg:px-8 h-[72px]">
        {/* Logo + Nav */}
        <div className="flex items-center gap-10 h-full">
          <button
            type="button"
            className="cursor-pointer shrink-0"
            onClick={() => router.push("/markets")}
          >
            <Image priority alt="Securd" src={SecurdLogo} />
          </button>

          <nav className="hidden sm:flex items-center gap-1 h-full">
            {NAV.map(({ label, href, tab }) => (
              <Link
                key={href}
                href={href}
                className={`
                  px-4 h-full flex items-center text-sm font-bold tracking-wide transition-colors
                  ${activeTab === tab
                    ? "text-securdWhite border-b-2 border-securdPrimaryLight"
                    : "text-securdGrey hover:text-securdWhite"
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Connect button — desktop */}
        <div className="hidden sm:block">
          <ConnectButton />
        </div>

        {/* Hamburger — mobile */}
        <button
          type="button"
          className="sm:hidden text-securdWhite"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-securdBlack border-t border-white/10 py-4 px-6 flex flex-col gap-3">
          {NAV.map(({ label, href, tab }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={`py-2 text-sm font-bold ${
                activeTab === tab
                  ? "text-securdWhite"
                  : "text-securdGrey"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;

function ConnectButton() {
  const { account, connected, openPicker, disconnect } = useWallet();
  const [proxyAddress, setProxyAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (account?.address) {
      getProxyAddress(account.address).then(setProxyAddress).catch(console.error);
    } else {
      setProxyAddress(null);
    }
  }, [account?.address]);

  if (!connected || !account) {
    return (
      <button
        type="button"
        onClick={openPicker}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-securdPrimaryLight text-securdBlack font-bold text-sm hover:opacity-90 transition-opacity"
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  const truncated = `${account.address.slice(0, 6)}…${account.address.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address);
    toast.success("Address copied to clipboard");
  };

  const xrplLink = `${EXPLORER_XRPL_LEDGER}/accounts/${account.address}`;
  const axelarLink = `${AXELARSCAN_URL}/address/${account.address}`;
  const evmLink = proxyAddress ? `${EXPLORER_XRPL_EVM}/address/${proxyAddress}` : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-securdWhite text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none"
        >
          <Wallet size={16} />
          {truncated}
          <ChevronDown size={14} className="text-securdGrey" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-[#1a1d20] border-white/10 text-securdWhite"
      >
        <DropdownMenuItem
          onClick={copyAddress}
          className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-securdWhite"
        >
          <Copy size={16} />
          <span>Copy address</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem asChild>
          <a
            href={xrplLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-securdWhite px-2 py-1.5 text-sm"
          >
            <ExternalLink size={16} />
            <span>View on XRPL Explorer</span>
          </a>
        </DropdownMenuItem>

        {evmLink && (
          <DropdownMenuItem asChild>
            <a
              href={evmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-securdWhite px-2 py-1.5 text-sm"
            >
              <ExternalLink size={16} />
              <span>View on XRPL EVM Explorer</span>
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <a
            href={axelarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-securdWhite px-2 py-1.5 text-sm"
          >
            <ExternalLink size={16} />
            <span>View on Axelarscan</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          onClick={openPicker}
          className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-securdWhite"
        >
          <ArrowLeftRight size={16} />
          <span>Switch Wallet</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="flex items-center gap-2 cursor-pointer text-systemRed focus:bg-systemRed/10 focus:text-systemRed"
        >
          <LogOut size={16} />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
