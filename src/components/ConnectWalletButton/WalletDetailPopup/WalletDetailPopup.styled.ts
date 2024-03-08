"use client";
import styled from "styled-components";

export const WalletDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #fcfcfc;
  box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  width: 379px;
  padding: 16px;
  gap: 16px;
  position: absolute;
  top: 40px;
  right: 0;
  color: ${(props) => props.theme.colors.securdBlack};

  p {
    font-size: 16px;
    letter-spacing: 0.02em;
  }

  img {
    width: 24px;
    height: 24px;
    margin-right: 5px;
  }

  @media only screen and (max-width: 800px) {
    left: 0;
  }
`;

export const DetailSection = styled.a`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  text-decoration: none;
  padding: 0.6rem 0;
  cursor: pointer;
  color: inherit;
`;

export const NetworkWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  padding: 1.2rem 0;
`;

export const SmallTitle = styled.div`
  font-size: 14px;
  letter-spacing: -0.02em;
`;

export const Network = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  div {
    border-radius: 50%;
    width: 12px;
    height: 12px;
    background: #3cc27a;
  }
`;

export const DisconnectButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 38px;
  border: 2px solid #e95a4c;
  border-radius: 6px;
  color: #e95a4c;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;

export const SwitchWalletButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 190px;
  height: 38px;
  border: none;
  border-radius: 6px;
  background-color: #0b4b48;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
`;
