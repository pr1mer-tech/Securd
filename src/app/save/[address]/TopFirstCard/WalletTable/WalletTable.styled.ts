"use client";
import styled from "styled-components";

export const TopTableWrapper = styled.div<{
  borderRadius: string;
}>`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.securdLightGrey};
  border-radius: ${(props) => props.borderRadius};

  @media only screen and (max-width: 1100px) {
    border-right: none;
  }
`;

export const BalanceTable = styled.table`
  width: 100%;
  margin: 0.5rem 0;
  text-align: center;
  border-collapse: separate;
  border-spacing: 1rem 0;

  & > tbody {
    width: 100%;
  }

  @media only screen and (max-width: 1200px) {
    border-spacing: none;
  }
`;

export const MainColCell = styled.td<{
  align?: string;
  fontWeight?: number;
  padding?: string;
}>`
  padding: ${(props) => props.padding || "0"};
  text-align: ${(props) => props.align || "center"};
  font-size: 1.35rem;
  width: 40%;
  font-weight: ${(props) => props.fontWeight || 400};
`;
