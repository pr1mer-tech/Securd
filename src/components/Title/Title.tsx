import React, { FC, ReactNode } from "react";
import { TitleLabel } from "./Title.styled";

type TitleProps = {
  label: string | ReactNode;
  priority: 1 | 2 | 3 | 4;
  color?: string;
  margin?: string;
  fontWeight?: number;
};

const Title: FC<TitleProps> = ({
  label,
  priority,
  color,
  margin,
  fontWeight,
}) => {
  return (
    <TitleLabel
      priority={priority}
      color={color}
      margin={margin}
      fontWeight={fontWeight}
    >
      {label}
    </TitleLabel>
  );
};

export default Title;
