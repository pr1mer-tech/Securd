"use client";
import styled from "styled-components";

export const DexLinkWrapper = styled.a<{
  scale?: number;
  transformOrigin?: string;
}>`
  text-decoration: none;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.securdBlack};
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: #d9d9d9;
  border-radius: 7px;
  border: 1px solid #666666;
  padding: 0.2rem;
  scale: ${(props) => props.scale || 1};
  /* transform-origin: ${(props) => props.transformOrigin || "center"}; */
  -webkit-transform-origin-x: ${(props) => props.transformOrigin || "center"};
  -webkit-transform-origin-y: ${(props) => props.transformOrigin && "top"};
`;
