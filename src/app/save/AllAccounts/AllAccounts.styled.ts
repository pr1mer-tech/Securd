"use client";
import styled from "styled-components";

export const BottomPageContainer = styled.div<{
  mobilePadding?: string;
}>`
  width: 100%;
  padding: 2rem 6rem;

  @media only screen and (max-width: 800px) {
    padding: ${(props) => props.mobilePadding || "1rem 2rem"};
  }
`;

export const TopRow = styled.div<{
  margin?: string;
  mobileColumn?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${(props) => props.margin};

  @media only screen and (max-width: 800px) {
    flex-direction: ${(props) => (props.mobileColumn ? "column" : "row")};
    align-items: ${(props) => (props.mobileColumn ? "flex-start" : "center")};
    gap: ${(props) => (props.mobileColumn ? "1rem" : "initial")};
  }
`;

export const Row = styled.div<{
  color?: string;
  gap?: string;
  mobileHide?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.gap || "5rem"};
  color: ${(props) => props.color || "inherit"};

  @media only screen and (max-width: 800px) {
    display: ${(props) => (props.mobileHide ? "none" : "flex")};
  }
`;

export const AllAccountsNumber = styled.div`
  font-weight: 400;
  font-size: 17px;
`;
