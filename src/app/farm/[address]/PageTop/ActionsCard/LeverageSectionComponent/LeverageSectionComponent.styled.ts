"use client";
import styled from "styled-components";

export const ActionSectionContainer = styled.div`
  h1 {
    color: var(--securd-primary, #0b4b48);
    text-align: justify;
    font-family: Inter;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }
`;

export const InfoWalletListContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const InfoWalletContainer = styled.div`
  h2 {
    color: var(--securd-grey, #90a0b0);
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
  p {
    margin: 0;
    color: var(--securd-black, #131517);
    font-family: Inter;
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }
`;

export const UtilisationText = styled.p`
  color: var(--securd-black, #131517);
  font-family: Inter;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-bottom: 8px;
`;

export const ActionContainer = styled.div`
  color: var(--securd-black, #131517);
  font-family: Inter;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const ActionButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 40px;
`;

export const LeverageSliderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

export const InputAmountContainer = styled.div<{
  width?: number;
  paddingleft?: string;
}>`
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
  display: flex;
  border-radius: 6px;
  justify-content: space-between;
  border: solid #8c8c8c 1px;
  height: 58px;
  padding-right: 0;
  padding-left: ${(props) =>
    props.paddingleft ? `${props.paddingleft}` : "24px"};
  width: ${(props) => (props.width ? `${props.width}%` : "100%")};
  gap: 0.5rem;
`;

export const InputAmount = styled.input<{ textpos?: string }>`
  width: 70%;
  border: none;
  background-color: transparent;
  text-align: ${(props) => props.textpos && props.textpos};
  outline: none;
`;

export const InputAmountLeverage = styled.input<{ textpos?: string }>`
  width: 70%;
  border: none;
  background-color: transparent;
  text-align: ${(props) => props.textpos && props.textpos};
  color: var(--grey-scale-80, #333);
  text-align: right;
  font-family: Inter;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  outline: none;
`;

export const AssetSectionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
