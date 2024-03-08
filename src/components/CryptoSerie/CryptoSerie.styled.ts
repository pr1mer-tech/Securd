"use client";
import styled from "styled-components";

export const Serie = styled.div`
  display: flex;
  align-items: center;
`;

export const CryptoAmount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  background-color: ${(props) => props.theme.colors.securdWhite};
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-left: -10px;
  z-index: 10;
`;

export const LogoWrapper = styled.div<{
  zIndex: number;
}>`
  margin-left: -10px;
  z-index: ${(props) => props.zIndex};
  display: flex;
  align-items: center;
  justify-content: center;
`;
