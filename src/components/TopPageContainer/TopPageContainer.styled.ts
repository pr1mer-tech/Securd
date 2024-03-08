"use client";
import styled from "styled-components";

export const TopMainContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  height: auto;
  width: 100%;

  & > div {
    grid-row-start: 1;
    grid-column-start: 1;
  }
`;

export const SectionsContainer = styled.div`
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
`;

export const FirstSection = styled.div`
  height: 170px;
  width: 100%;
  background-color: ${(props) => props.theme.colors.securdPrimary};
`;

export const SecondSection = styled.div<{
  height?: string;
}>`
  flex: 1;
  min-height: ${(props) => props.height || "calc(80vh - 170px)"};
  width: 100%;
  background-color: ${(props) => props.theme.colors.securdPrimaryLight};
`;

export const ChildrenContainer = styled.div<{
  padding?: string;
  mobilePadding?: string;
}>`
  width: 100%;
  height: 100%;
  z-index: 2;
  padding: ${(props) => props.padding || "1.5rem 6rem"};

  @media only screen and (max-width: 800px) {
    padding: ${(props) => props.mobilePadding || "1rem 2rem"};
  }
`;
