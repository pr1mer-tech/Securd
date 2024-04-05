"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SecurdLogo from "@/assets/logos/securd-logo.svg";
import { usePathname, useRouter } from "next/navigation";
import { ActiveTab } from "@/lib/types/enums";
import { ConnectKitButton } from "connectkit";
import { MenuIcon, XIcon } from "lucide-react";

const Header = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.SAVE);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname?.includes("/save")) {
            setActiveTab(0);
        } else if (pathname?.includes("farm")) {
            setActiveTab(1);
        } else if (pathname?.includes("analytics")) {
            setActiveTab(2);
        }
    }, [pathname]);

    return (
        <div className="relative z-49 bg-black">
            <div className="flex items-center justify-between bg-securdBlack text-white px-8 h-[72px] sm:px-4">
                <div className="flex items-center gap-16 h-full">
                    <div className="cursor-pointer" onClick={() => router.push("/save")}>
                        <Image priority={true} alt="securd logo" src={SecurdLogo} />
                    </div>
                    <div className="hidden sm:flex items-center gap-4 h-full">
                        <Link
                            href="/save"
                            className={`px-4 h-full leading-[72px] font-bold ${activeTab === ActiveTab.SAVE
                                ? "border-b-4 border-b-securdWhite"
                                : "text-securdWhite"
                                }`}
                        >
                            Save
                        </Link>
                        <Link
                            href="/farm"
                            className={`px-4 h-full leading-[72px] font-bold ${activeTab === ActiveTab.FARM
                                ? "border-b-4 border-b-securdWhite"
                                : "text-securdWhite"
                                }`}
                        >
                            Farm
                        </Link>
                        <Link
                            href="/analytics"
                            className={`px-4 h-full leading-[72px] font-bold ${activeTab === ActiveTab.ANALYTICS
                                ? "border-b-4 border-b-securdWhite"
                                : "text-securdWhite"
                                }`}
                        >
                            Analytics
                        </Link>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <ConnectKitButton />
                </div>
                <button
                    className="sm:hidden block"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <XIcon /> : <MenuIcon />}
                </button>
            </div>
            {isMenuOpen && (
                <div className="sm:hidden bg-securdBlack text-white py-4">
                    <Link
                        href="/save"
                        className={`block px-8 py-2 ${activeTab === ActiveTab.SAVE
                            ? "bg-securdWhite text-securdBlack"
                            : "text-securdWhite"
                            }`}
                    >
                        Save
                    </Link>
                    <Link
                        href="/farm"
                        className={`block px-8 py-2 ${activeTab === ActiveTab.FARM
                            ? "bg-securdWhite text-securdBlack"
                            : "text-securdWhite"
                            }`}
                    >
                        Farm
                    </Link>
                    <div className="px-8 pt-4">
                        <ConnectKitButton />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;