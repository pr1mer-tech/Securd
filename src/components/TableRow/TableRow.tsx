import React, { FC, ReactNode, useContext } from "react";
import { MainContext } from "../../context/Main.context";
import { RowWrapper } from "./TableRow.styled";

type TableRowProps = {
  children: ReactNode[];
  border?: boolean;
  onClick?: () => void;
  padding?: string;
};

const TableRow: FC<TableRowProps> = ({
  children,
  border,
  onClick,
  padding,
}) => {
  const { windowWidth } = useContext(MainContext);

  return (
    <RowWrapper
      border={border}
      clickable={onClick ? true : false}
      onClick={onClick}
      padding={padding}
      windowWidth={windowWidth}
    >
      {children}
    </RowWrapper>
  );
};

export default TableRow;
