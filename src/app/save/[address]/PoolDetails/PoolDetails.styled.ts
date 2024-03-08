"use client";
import styled from "styled-components";

export const BottomPageContainer = styled.div<{
  mobilePadding?: string;
}>`
  width: 100%;
  height: 100%;
  padding: 2rem 6rem;

  @media only screen and (max-width: 800px) {
    padding: ${(props) => props.mobilePadding || "1rem 2rem"};
  }
`;
