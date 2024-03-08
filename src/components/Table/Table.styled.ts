import styled from "styled-components";

export const TableWrapper = styled.table<{
  margin?: string;
}>`
  width: 100%;
  margin: ${(props) => props.margin};
  text-align: left;
  border-collapse: collapse;
`;

export const HeaderRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};
`;

export const HeaderCell = styled.th`
  padding: 1rem;
`;

export const TableBody = styled.tbody<{
  dashedRows?: boolean;
}>`
  & tr:nth-child(2n + 1) {
    background-color: ${(props) =>
      props.dashedRows && props.theme.colors.securdLightGrey} !important;
  }
`;
