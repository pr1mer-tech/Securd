"use client";
import styled from "styled-components";

export const Label = styled.div<{
  color?: string;
  fontSize?: string;
}>`
  font-weight: 400;
  font-size: ${(props) => props.fontSize || "14px"};
  color: ${(props) => props.color || props.theme.colors.securdGrey};
`;
