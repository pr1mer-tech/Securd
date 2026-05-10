"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SecurdLogo from "@/assets/logos/securd-logo.svg";
import { usePathname, useRouter } from "next/navigation";
import { ActiveTab } from "@/lib/types/enums";
import { ConnectKitButton } from "@hyper-gate/connectkit";
import { MenuIcon, XIcon } from "lucide-react";

const NAV = [
  { label: "Markets", href: "/markets", tab: ActiveTab.MARKETS },
  { label: "Analytics", href: "/analytics", tab: ActiveTab.ANALYTICS },
];

const Header = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.MARKETS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname?.startsWith("/analytics")) {
      setActiveTab(ActiveTab.ANALYTICS);
    } else {
      setActiveTab(ActiveTab.MARKETS);
    }
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
          <ConnectKitButton />
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
            <ConnectKitButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
