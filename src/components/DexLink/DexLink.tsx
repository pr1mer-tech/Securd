"use client";
import React, { FC } from "react";
import { DexLinkWrapper } from "./DexLink.styled";
import UniswapLogo from "@/assets/uniswap-logo.svg";
import Image from "next/image";

type DexLinkProps = {
  label: string;
  to: string;
  icon?: string;
  scale?: number;
  transformOrigin?: string;
};

const DexLink: FC<DexLinkProps> = ({ label, to, scale, transformOrigin }) => {
  return (
    <DexLinkWrapper href={to} scale={scale} transformOrigin={transformOrigin}>
      <Image src={UniswapLogo} alt="uni" />
      <div>{label}</div>
    </DexLinkWrapper>
  );
};

export default DexLink;
