import React, { FC } from "react";
import { PillWrapper } from "./Pill.styled";

type PillProps = {
  label: string;
  selected: boolean;
  onClick?: () => void;
};

const Pill: FC<PillProps> = ({ label, selected, onClick }) => {
  return (
    <PillWrapper selected={selected} onClick={onClick}>
      {label}
    </PillWrapper>
  );
};

export default Pill;
