import React, { FC, ReactNode } from "react";
import TableText from "../../components/TableText/TableText";
import { HeaderCell, HeaderRow, TableBody, TableWrapper } from "./Table.styled";
import { main } from "@/app/styles/theme.styled";
import { TableTextType } from "@/utils/types/enums";

type TableProps = {
  columns: string[] | ReactNode[];
  children: ReactNode | ReactNode[];
  margin?: string;
  dashedRows?: boolean;
};

const Table: FC<TableProps> = ({ columns, children, margin, dashedRows }) => {
  return (
    <TableWrapper margin={margin}>
      <thead>
        <HeaderRow>
          {columns.map((col: string | ReactNode, key: number) => (
            <HeaderCell key={key}>
              <TableText
                type={TableTextType.TITLE}
                label={col}
                color={main.colors.securdPrimary}
              />
            </HeaderCell>
          ))}
        </HeaderRow>
      </thead>
      <TableBody dashedRows={dashedRows}>{children}</TableBody>
    </TableWrapper>
  );
};

export default Table;
