"use client";
import styled from "styled-components";

export const Wrapper = styled.div`
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.securdLightGrey};
  border-radius: 12px;
  width: 50%;

  @media only screen and (max-width: 1300px) {
    width: 100%;
  }
`;

export const SavingsStatsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  width: 100%;
  border-top: 1px solid ${(props) => props.theme.colors.securdLightGrey};
`;

export const SavingsStatLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  text-align: left;
`;

export const SavingsStat = styled.div`
  font-size: 18px;
  font-weight: 500;
  text-align: right;
  margin-top: 0.2rem;
`;
