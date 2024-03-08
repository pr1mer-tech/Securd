"use client";
import styled from "styled-components";

export const MenuWrapper = styled.div`
  position: absolute;
  top: 59px;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: ${(props) => props.theme.colors.securdBlack};
  color: white;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
`;

export const WalletButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

export const ChevronButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

export const DisconnectButton = styled.button`
  background: none;
  border: none;
  width: 100%;
  color: ${(props) => props.theme.colors.securdWhite};
  font-family: inherit;
  font-style: italic;
  font-size: 14px;
  font-weight: 400;
  margin-top: 2rem;
`;
