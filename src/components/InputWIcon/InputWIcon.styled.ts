"use client";
import styled from "styled-components";

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media only screen and (max-width: 800px) {
    width: 100%;
  }
`;

export const Input = styled.input`
  flex: 1;
  height: 28px;
  border: none;
  outline: none;
  font-size: 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};
  background: transparent;
`;
