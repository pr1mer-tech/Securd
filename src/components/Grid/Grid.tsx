import React, { FC, ReactNode } from "react";
import { GridWrapper } from "./Grid.styled";

type GridProps = {
  children: ReactNode;
  rowItems: number;
  columnGap?: string;
  rowGap?: string;
  margin?: string;
};

const Grid: FC<GridProps> = ({
  children,
  rowItems,
  columnGap,
  rowGap,
  margin,
}) => {
  return (
    <GridWrapper
      rowItems={rowItems}
      columnGap={columnGap}
      rowGap={rowGap}
      margin={margin}
    >
      {children}
    </GridWrapper>
  );
};

export default Grid;
