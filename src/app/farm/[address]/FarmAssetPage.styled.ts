"use client";
import styled from "styled-components";

export const BorrowAssetPageWrapper = styled.div``;

export const BackButtonWrapper = styled.div`
  position: absolute;
  top: 2.5rem;
  left: 1.3rem;
  z-index: 15;
`;

export const TopTableWrapper = styled.div<{
  borderRadius?: string;
}>`
  padding: 1rem;
  background-color: ${(props) => props.theme.colors.securdLightGrey};
  border-radius: ${(props) => props.borderRadius || "20px 0 0 20px"};

  @media only screen and (max-width: 1100px) {
    border-right: none;
  }
`;

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

export const APYWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const RigthFigure = styled.div`
  text-align: right;
`;

export const DashboardWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-evenly;

  @media only screen and (max-width: 500px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-row-gap: 1rem;

    & > div {
      max-width: 90px;
    }
  }
`;

export const MainColCell = styled.td<{
  align?: string;
  padding?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.align === "left" ? "flex-start" : "space-between"};
  padding: ${(props) => props.padding || "0"};

  & > div:last-child {
    text-align: ${(props) => props.align || "center"};
  }
`;

export const DexLinkWrapper = styled.div`
  scale: 0.7;
`;

export const SliderWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RowInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;

  @media only screen and (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
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
