"use client";
import styled from "styled-components";

export const Button = styled.button<{
  active: boolean;
  color: string;
  defaultOutlined?: boolean;
  fontSize?: string;
  height?: string;
  outline: boolean;
  outlineColor?: string;
  padding?: string;
  textAlign?: string;
  width?: string;
}>`
  height: ${(props) => props.height || "100%"};
  width: ${(props) => props.width || "auto"};
  color: ${(props) => props.color};
  border: none;
  border-bottom: ${(props) =>
    (props.active && props.outline) || props.defaultOutlined
      ? `4px solid ${props.outlineColor || props.color}`
      : "none"};
  background: none;
  outline: none;
  user-select: none;
  cursor: pointer;
  font-size: ${(props) => props.fontSize || "18px"};
  font-weight: 700;
  font-family: inherit;
  text-align: ${(props) => props.textAlign || "center"};
  padding: ${(props) => props.padding || "0"};

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;
