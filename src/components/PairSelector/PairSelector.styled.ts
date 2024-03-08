"use client";
import styled from "styled-components";

export const PairSelectorContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 4px;
  background: var(--securd-light-grey, #e0e0e0);
  border-radius: 8px;
`;
export const PairAsset = styled.div<{ selected: boolean }>`
  color: #2d3d61;
  cursor: pointer;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  background: ${(props) => props.selected && "#fcfcfc"};
  border-radius: 8px;
  font-weight: 500;
  padding: 4px 12px;
`;

export const PairAssetSelected = styled.div`
  color: #2d3d61;
  font-family: Inter;
`;
