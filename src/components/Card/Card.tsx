import React, { FC, ReactNode } from "react";
import { CardWrapper } from "./Card.styled";

type CardProps = {
  children: ReactNode;
  borderColor?: string;
  borderLeft?: boolean;
  borderRadius?: string;
  height?: string;
  margin?: string;
  padding?: string;
  onClick?: () => void;
  shadow?: boolean;
  width?: string;
};

const Card: FC<CardProps> = ({
  borderColor,
  borderLeft,
  borderRadius,
  children,
  height,
  margin,
  onClick,
  padding,
  shadow,
  width,
}) => {
  return (
    <CardWrapper
      borderColor={borderColor}
      borderLeft={borderLeft}
      borderRadius={borderRadius}
      clickable={onClick ? true : false}
      height={height}
      margin={margin}
      onClick={onClick}
      padding={padding}
      shadow={shadow}
      width={width}
    >
      {children}
    </CardWrapper>
  );
};

export default Card;
