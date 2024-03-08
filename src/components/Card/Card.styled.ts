"use client";
import styled from "styled-components";

export const CardWrapper = styled.div<{
  borderColor?: string;
  borderLeft?: boolean;
  borderRadius?: string;
  clickable?: boolean;
  height?: string;
  margin?: string;
  padding?: string;
  shadow?: boolean;
  width?: string;
}>`
  border-radius: ${(props) => props.borderRadius || "20px"};
  background-color: ${(props) => props.theme.colors.securdWhite};
  margin: ${(props) => props.margin || "0"};
  padding: ${(props) => props.padding || "1rem"};
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "auto"};
  box-shadow: ${(props) => props.shadow && "0px 6px 18px rgba(0, 0, 0, 0.15)"};
  border: ${(props) => props.borderColor && `2px solid ${props.borderColor}`};
  border-left: ${(props) =>
    props.borderLeft && "1px solid" + props.theme.colors.securdLightGrey};
  cursor: ${(props) => props.clickable && "pointer"};

  &:hover {
    opacity: ${(props) => props.clickable && "0.8"};
  }
`;
