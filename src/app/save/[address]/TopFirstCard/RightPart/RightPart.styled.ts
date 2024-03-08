"use client";
import styled from "styled-components";

export const RightPartContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};
`;

export const APYWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;

  @media only screen and (max-width: 1100px) {
    flex: 1;
  }
`;

export const WalletBalanceLabel = styled.div`
  font-size: 14px;
  font-weight: 400;
  text-align: right;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RowInputWrapper = styled.form`
  display: flex;
  align-items: center;
  position: relative;
  gap: 1rem;
  margin: 1rem 0;

  @media only screen and (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SliderWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardTitleWrapper = styled.div<{
  borderColor?: string;
}>`
  width: 100%;
  border-bottom: 1px solid
    ${(props) => props.borderColor || props.theme.colors.securdWhite};
  padding: 0.7rem 0;
  margin-bottom: 1rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;
