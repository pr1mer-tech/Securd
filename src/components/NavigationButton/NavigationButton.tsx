import React, { FC, MouseEventHandler } from "react";
import { Button } from "./NavigationButton.styled";

type NavigationButtonProps = {
  active: boolean;
  color: string;
  defaultOutlined?: boolean;
  fontSize?: string;
  height?: string;
  label: string | undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  outline?: boolean;
  outlineColor?: string;
  padding?: string;
  textAlign?: string;
  width?: string;
};

const NavigationButton: FC<NavigationButtonProps> = ({
  active,
  color,
  defaultOutlined = false,
  fontSize,
  height,
  label,
  onClick,
  outline = true,
  outlineColor,
  padding,
  textAlign,
  width,
}: NavigationButtonProps) => {
  return (
    <Button
      active={active}
      color={color}
      defaultOutlined={defaultOutlined}
      fontSize={fontSize}
      height={height}
      onClick={onClick}
      outline={outline}
      outlineColor={outlineColor}
      padding={padding}
      textAlign={textAlign}
      width={width}
    >
      {label}
    </Button>
  );
};

export default NavigationButton;
