import React, { FC, ReactNode } from "react";
import { Text } from "./TableText.styled";
import { TableTextType } from "@/utils/types/enums";

type TableTextProps = {
  color?: string;
  label: string | ReactNode;
  type: TableTextType;
};

const TableText: FC<TableTextProps> = ({ color, label, type }) => {
  return (
    <Text color={color} type={type ? type : TableTextType.BODY}>
      {label}
    </Text>
  );
};

export default TableText;
