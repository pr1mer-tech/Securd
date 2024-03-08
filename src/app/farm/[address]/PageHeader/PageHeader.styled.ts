"use client";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

export const RightItems = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: ${(props) => props.theme.colors.securdWhite};
`;

export const APYPct = styled.div`
  font-size: 28px;
  font-weight: 600;
`;
