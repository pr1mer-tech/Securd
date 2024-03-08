"use client";
import styled from "styled-components";

export const WrapperModalConnection = styled.div`
  width: 400px;
  padding: 2rem;
  font-weight: 700;
`;

export const WalletButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const WalletButton = styled.button`
  display: flex;
  height: 50px;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.securdLightGrey};
  background: none;
  padding-left: 0.75rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.securdBlack};
  font-weight: bold;
  font-size: 1.25rem;
  line-height: 1.75rem;

  &:hover {
    background: ${(props) => props.theme.colors.securdLightGrey};
  }
`;
