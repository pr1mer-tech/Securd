"use client";
import { PriorityLevel } from "@/utils/types/enums";
import styled from "styled-components";

export const ButtonContent = styled.button<{
  priority: PriorityLevel;
  color?: string;
  width?: string;
  height?: string;
  padding?: string;
  fontWeight?: number;
  fontSize?: string;
  underlined?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: ${(props) => props.padding || "0"};
  width: ${(props) => props.width || "auto"};
  height: ${(props) => props.height || "100%"};
  color: ${(props) =>
    props.priority === PriorityLevel.SECONDARY
      ? props.theme.colors.securdWhite
      : props.color
      ? props.color
      : props.theme.colors.securdPrimary};
  background-color: ${(props) =>
    props.priority === PriorityLevel.PRIMARY
      ? props.theme.colors.securdWhite
      : props.priority === PriorityLevel.SECONDARY
      ? props.theme.colors.securdPrimary
      : "transparent"};
  text-decoration: ${(props) => (props.underlined ? "underline" : "none")};
  border-radius: 6px;
  border: ${(props) =>
    props.priority === PriorityLevel.TERTIARY
      ? "none"
      : `2px solid ${props.theme.colors.securdPrimary}`};
  font-size: ${(props) => props.fontSize || "18px"};
  font-weight: ${(props) => props.fontWeight || 700};
  font-family: inherit;
  cursor: pointer;

  &:hover {
    scale: 1.02;
    opacity: 0.9;
  }
  &:disabled {
    background-color: grey;
    border: 2px solid grey;
    cursor: not-allowed;
  }
`;
