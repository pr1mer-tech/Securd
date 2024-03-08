import React, { FC, ChangeEvent } from "react";
import { Input, InputWrapper } from "./InputWIcon.styled";
import Image from "next/image";

type InputWIconProps = {
  placeholder: string;
  icon?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const InputWIcon: FC<InputWIconProps> = ({ placeholder, icon, onChange }) => {
  return (
    <InputWrapper data-test-id="save-search">
      <Input placeholder={placeholder} onChange={onChange} />
      {icon && <Image src={icon} alt="loop" />}
    </InputWrapper>
  );
};

export default InputWIcon;
