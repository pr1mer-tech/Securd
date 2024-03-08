import styled from "styled-components";

export const RowWrapper = styled.tr<{
  border?: boolean;
  clickable?: boolean;
  padding?: string;
  windowWidth: number;
}>`
  border-bottom: ${(props) =>
    props.border ? "1px solid " + props.theme.colors.securdLightGrey : "none"};

  & > td {
    padding: ${(props) => props.padding || "0"};
  }

  &:hover {
    background-color: ${(props) =>
      props.clickable && "rgba(224, 224, 224, 0.7)"};
    cursor: ${(props) => props.clickable && "pointer"};
  }
`;
