"use client";
import styled from "styled-components";

export const TooltipWrapper = styled.div`
  color: ${(props) => props.theme.colors.securdBlack};
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.securdLightGrey};
  border-radius: 5px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;
