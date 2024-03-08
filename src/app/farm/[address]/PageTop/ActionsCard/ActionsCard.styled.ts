"use client";
import styled from "styled-components";

export const ButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

export const ActionButton = styled.button<{
  active: boolean;
}>`
  flex: 1;
  height: 120px;
  border-radius: 6px;
  border: 2px solid ${(props) => props.theme.colors.securdPrimary};
  color: ${(props) =>
    props.active
      ? props.theme.colors.securdWhite
      : props.theme.colors.securdPrimary};
  background: ${(props) =>
    props.active ? props.theme.colors.securdPrimary : "none"};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0;

  & .hover-icon {
    display: ${(props) => props.active && "none"};
    margin-top: -1rem;
    max-height: 0;
    -webkit-transition: all 0.2s linear 0s;
    transition: all 0.2s linear 0s;
    overflow: hidden;
  }

  &:hover {
    .hover-icon {
      max-height: 1rem;
      margin-top: 0;
      overflow: visible;
    }
  }

  &:disabled {
    cursor: not-allowed;
    border: 2px solid ${(props) => props.theme.colors.securdGrey};
    color: ${(props) => props.theme.colors.securdGrey};

    .hover-icon {
      display: none;
    }
  }
`;
