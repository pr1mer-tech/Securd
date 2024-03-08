"use client";
import styled from "styled-components";

export const HeaderContainer = styled.div`
  position: relative;
  overflow: visible;
  z-index: 49;
`;

export const HeaderWrapper = styled.div`
  width: 100%;
  height: 60px;
  color: white;
  background: ${(props) => props.theme.colors.securdBlack};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rem 3rem;

  @media only screen and (max-width: 800px) {
    padding: 0rem 1rem;
  }
`;

export const NavigationButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;

  @media only screen and (max-width: 800px) {
    display: none;
  }
`;

export const LeftHeaderItems = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
  height: 100%;
`;

export const ConnectWalletWrapper = styled.div`
  @media only screen and (max-width: 800px) {
    display: none;
  }
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: none;

  @media only screen and (max-width: 800px) {
    display: block;
  }
`;

export const MobileMenuWrapper = styled.div`
  @media only screen and (min-width: 800px) {
    display: none;
  }
`;

export const LogoWrapper = styled.div`
  cursor: pointer;
`;
