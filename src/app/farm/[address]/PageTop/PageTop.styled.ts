"use client";
import styled from "styled-components";

export const PageTopWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  & > div {
    flex: 1;
  }

  @media only screen and (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;

    & > div:last-child {
      order: 1;
    }

    & > div:first-child {
      order: 2;
    }
  }
`;

export const PageTopLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CardHeader = styled.div<{ collapse?: boolean }>`
  width: 100%;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};

  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${(props) => (props.collapse ? "pointer" : "default")};
`;

export const HeaderItems = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Table = styled.table`
  width: 100%;
  margin-top: 1rem;
  border-collapse: separate;
  border-spacing: 0;
`;

export const TableRow = styled.tr<{
  borderBottom?: boolean;
}>`
  td {
    border-bottom: ${(props) => props.borderBottom && "2px solid #F0F0F0"};
  }

  th {
    border-bottom: ${(props) => props.borderBottom && "2px solid #F0F0F0"};
  }
`;

export const TableHeaderCell = styled.th<{
  borderRight?: boolean;
}>`
  font-weight: 600;
  padding: 1.5rem 0;
  border-right: ${(props) => props.borderRight && "2px solid #F0F0F0"};
  text-align: center;

  @media only screen and (max-width: 500px) {
    font-size: 14px;
  }
`;

export const TableBodyCell = styled.td<{
  borderRight?: boolean;
  background?: string;
}>`
  font-weight: 400;
  padding: 1.5rem 0;
  border-right: ${(props) => props.borderRight && "2px solid #F0F0F0"};
  background: ${(props) => props.background};
`;

export const RowedCellBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 16px;

  @media only screen and (max-width: 500px) {
    gap: 0.2rem;
    font-size: 14px;
  }
`;

export const EvolutionLabel = styled.div<{
  evolution: "up" | "down" | "equal";
}>`
  font-weight: 700;
  color: ${(props) =>
    props.evolution === "up"
      ? props.theme.colors.systemGreen
      : props.evolution === "down" && props.theme.colors.systemRed};
`;
