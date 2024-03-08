import React from "react";
import { LoadingWrapper } from "./FarmPage.styled";
import Image from "next/image";
import SecurdLogo from "@/assets/logos/securd-logo.svg";

const loading = () => {
  return (
    <LoadingWrapper>
      <Image priority={true} alt="securd logo" src={SecurdLogo} />
    </LoadingWrapper>
  );
};

export default loading;
