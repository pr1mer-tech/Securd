import React, { FC, MouseEventHandler } from "react";
import { ButtonContent } from "./Button.styled";
import { ButtonType, IconPostion, PriorityLevel } from "@/utils/types/enums";
import Image from "next/image";

type ButtonProps = {
  color?: string;
  fontSize?: string;
  fontWeight?: number;
  height?: string;
  icon?: string;
  iconPosition?: IconPostion;
  label?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  padding?: string;
  priority: PriorityLevel;
  type?: ButtonType;
  underlined?: boolean;
  width?: string;
  disabled?: boolean;
};

const Button: FC<ButtonProps> = ({
  color,
  fontSize,
  fontWeight,
  height,
  icon,
  iconPosition,
  label,
  onClick,
  padding,
  priority,
  type,
  underlined,
  width,
  disabled,
}: ButtonProps) => {
  return (
    <ButtonContent
      disabled={disabled}
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      height={height}
      onClick={onClick}
      padding={padding}
      priority={priority}
      type={type || "button"}
      underlined={underlined}
      width={width}
    >
      {iconPosition === IconPostion.BEFORE && icon && (
        <Image src={icon} alt="button-icon" />
      )}
      {label && <div>{label}</div>}
      {iconPosition === IconPostion.AFTER && icon && (
        <Image src={icon} alt="button-icon" />
      )}
    </ButtonContent>
  );
};

export default Button;
