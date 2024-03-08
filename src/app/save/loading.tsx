import React from "react";
import Image from "next/image";
import SecurdLogo from "@/assets/logos/securd-logo.svg";
import { LoadingWrapper } from "../farm/FarmPage.styled";

const loading = () => {
  return (
    <LoadingWrapper>
      <Image priority={true} alt="securd logo" src={SecurdLogo} />
    </LoadingWrapper>
  );
};

export default loading;
