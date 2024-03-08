"use client";
import styled from "styled-components";

export const SliderWrapper = styled.div<{
  width?: string;
}>`
  padding: 2.5rem 0 1.5rem 0;
  width: ${(props) => props.width || "auto"};

  .horizontal-slider {
    width: 100%;
  }

  .thumb {
    height: 24px;
    width: 24px;
    background-color: ${(props) => props.theme.colors.securdPrimary};
    border: 2px solid ${(props) => props.theme.colors.securdWhite};
    border-radius: 100%;
    transform: translateY(-40%);
    cursor: pointer;
    outline: none;
  }

  .mark {
    height: 18px;
    width: 18px;
    background-color: ${(props) => props.theme.colors.securdPrimary};
    border: 2px solid ${(props) => props.theme.colors.securdWhite};
    border-radius: 100%;
    transform: translateY(-37%);
    cursor: pointer;
  }

  .track {
    height: 4px;
    background-color: ${(props) => props.theme.colors.securdGrey};
    max-width: 100%;
    margin: 0 12px;
  }

  .track-0 {
    height: 4px;
    background-color: ${(props) => props.theme.colors.securdPrimary};
  }
`;

export const LabelsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  position: relative;
`;

export const OffsetLabel = styled.div`
  position: absolute;

  &:nth-child(1) {
    top: 0;
    left: 0;
  }

  &:nth-child(2) {
    top: 0;
    left: calc(25% - 0.5rem);
  }

  &:nth-child(3) {
    top: 0;
    left: calc(50% - 1rem);
  }

  &:nth-child(4) {
    top: 0;
    left: calc(75% - 1.5rem);
  }

  &:nth-child(5) {
    top: 0;
    left: calc(100% - 1.8rem);
  }
`;
