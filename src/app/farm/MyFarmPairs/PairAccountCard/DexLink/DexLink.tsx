import React, { FC } from "react";
import { DexLinkWrapper } from "./DexLink.styled";
import UniswapLogo from "@/assets/uniswap-logo.svg";
import Image from "next/image";

type DexLinkProps = {
  label: string;
  to: string;
  icon?: string;
  scale?: number;
};

const DexLink: FC<DexLinkProps> = ({ label, to, scale }) => {
  return (
    <DexLinkWrapper href={to} scale={scale}>
      <Image src={UniswapLogo} alt="uni" />
      <div>{label}</div>
    </DexLinkWrapper>
  );
};

export default DexLink;
