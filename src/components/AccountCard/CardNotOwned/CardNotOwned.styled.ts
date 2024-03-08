"use client";
import styled from "styled-components";

export const NotOwnedWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

export const AccountStatLabel = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${(props) => props.theme.colors.securdPrimary};
`;

export const AccountStat = styled.div`
  font-size: 21px;
  font-weight: 500;
  margin: 0.3rem 0;
`;

export const SavingPct = styled.div`
  font-size: 24px;
  color: ${(props) => props.theme.colors.securdBlack};
  font-weight: 600;
  margin: 0.3rem 0;
`;
