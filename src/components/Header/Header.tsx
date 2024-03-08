"use client";
import React, { useEffect, useState } from "react";
import {
  ConnectWalletWrapper,
  HeaderContainer,
  HeaderWrapper,
  LeftHeaderItems,
  LogoWrapper,
  MenuButton,
  MobileMenuWrapper,
  NavigationButtonsWrapper,
} from "./Header.styled";
import SecurdLogo from "@/assets/logos/securd-logo.svg";
import NavigationButton from "../NavigationButton/NavigationButton";
import { main } from "@/app/styles/theme.styled";
import { ActiveTab } from "@/utils/types/enums";
import { usePathname, useRouter } from "next/navigation";
import CloseIconWhite from "@/assets/icons/close-icon-white.svg";
import MenuIcon from "@/assets/icons/menu-icon.svg";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import Image from "next/image";
import MobileHeaderMenu from "./MobileHeaderMenu/MobileHeaderMenu";

const Header = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.SAVE);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname?.includes("/save")) {
      setActiveTab(0);
    } else if (pathname?.includes("farm")) {
      setActiveTab(1);
    }
  }, [pathname]);

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <LeftHeaderItems>
          <LogoWrapper>
            <Image
              priority={true}
              alt="securd logo"
              onClick={() => router.push("/save")}
              src={SecurdLogo}
            />
          </LogoWrapper>
          <NavigationButtonsWrapper>
            <NavigationButton
              active={activeTab === ActiveTab.SAVE}
              color={main.colors.securdWhite}
              label="Save"
              onClick={() => router.push("/save")}
              width="100px"
            />
            <NavigationButton
              active={activeTab === ActiveTab.FARM}
              color={main.colors.securdWhite}
              label="Farm"
              onClick={() => router.push("/farm")}
              width="100px"
            />
          </NavigationButtonsWrapper>
        </LeftHeaderItems>
        <ConnectWalletWrapper>
          <ConnectWalletButton />
        </ConnectWalletWrapper>
        <MenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <Image
            alt="header icon"
            src={showMobileMenu ? CloseIconWhite : MenuIcon}
          />
        </MenuButton>
      </HeaderWrapper>
      {showMobileMenu && (
        <MobileMenuWrapper>
          <MobileHeaderMenu />
        </MobileMenuWrapper>
      )}
    </HeaderContainer>
  );
};

export default Header;
