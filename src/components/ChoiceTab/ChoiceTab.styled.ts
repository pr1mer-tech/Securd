"use client";
import styled from "styled-components";

export const ChoiceTabWrapper = styled.div<{
  backgroundColor?: string;
  icons?: boolean;
  mobileHide?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: ${(props) =>
    props.backgroundColor || props.theme.colors.securdWhite};
  padding: 0.4rem;
  border-radius: ${(props) => (props.icons ? "4px" : "15px")};

  @media only screen and (max-width: 800px) {
    display: ${(props) => (props.mobileHide ? "none" : "flex")};
  }
`;

export const Tab = styled.div<{
  active?: boolean;
  activeColor?: string;
  icons?: boolean;
}>`
  padding: 0.5rem;
  cursor: pointer;
  background-color: ${(props) =>
    props.active
      ? props.activeColor || props.theme.colors.securdPrimaryLight
      : "transparent"};
  border-radius: ${(props) => (props.icons ? "4px" : "10px")};
  font-size: 12px;
  flex: 1;
  min-width: ${(props) => (props.icons ? "auto" : "80px")};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.securdLightGrey};
  }
`;
