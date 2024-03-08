"use client";
import React, { useContext } from "react";
import { Wrapper } from "./PageHeader.styled";
import { main } from "@/app/styles/theme.styled";
import Title from "@/components/Title/Title";
import { MainContext } from "@/context/Main.context";

const PageHeader = () => {
  const { isConnected } = useContext(MainContext);

  return (
    <>
      <Wrapper>
        <Title label="Save" priority={1} color={main.colors.securdWhite} />
      </Wrapper>
      {isConnected && (
        <Wrapper>
          <Title label="Summary" priority={3} color={main.colors.securdWhite} />
        </Wrapper>
      )}
    </>
  );
};

export default PageHeader;
