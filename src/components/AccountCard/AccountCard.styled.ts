"use client";
import styled from "styled-components";

export const CardHeader = styled.div<{
  owned?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: ${(props) =>
    props.owned && `1px solid ${props.theme.colors.securdLightGrey}`};
`;

export const CyrptoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

export const SavingsHeader = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const SavingsLabel = styled.div`
  font-size: 14px;
  font-weight: 400;
  padding-bottom: 0.4rem;
  margin-right: 0.5rem;
`;

export const DollarPrice = styled.div`
  width: 100%;
  color: ${(props) => props.theme.colors.securdGrey};
  font-weight: 400;
  font-size: 14px;
  text-align: right;
  letter-spacing: -0.02em;
`;
