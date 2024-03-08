"use client";
import styled from "styled-components";

export const DataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const ConvertedLabel = styled.div<{
  before?: boolean;
}>`
  font-size: 14px;
  color: ${(props) => props.before && props.theme.colors.securdGrey};

  @media only screen and (max-width: 500px) {
    font-size: 12px;
  }
`;

export const PairWrapper = styled.div`
  display: flex;
  flex-direction: column;

  & > img:first-child {
    margin-bottom: -4px;
    z-index: 1;
  }
`;

export const PairLabel = styled.div`
  font-size: 18px;

  @media only screen and (max-width: 500px) {
    font-size: 14px !important;
  }
`;

export const DexLabel = styled.div`
  margin-top: 0.2rem;
  opacity: 0.7;
  font-size: 14px;
  cursor: pointer;

  @media only screen and (max-width: 500px) {
    font-size: 12px;
  }
`;
