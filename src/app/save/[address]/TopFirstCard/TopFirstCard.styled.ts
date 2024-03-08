"use client";
import styled from "styled-components";

export const TopCardContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;

  & > div:first-child {
    flex: 2;
  }

  & > div:last-child {
    flex: 3;
  }

  @media only screen and (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const CardTitleWrapper = styled.div<{
  borderColor?: string;
}>`
  width: 100%;
  border-bottom: 1px solid
    ${(props) => props.borderColor || props.theme.colors.securdWhite};
  padding: 0.7rem 0;
  margin-bottom: 1rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;
