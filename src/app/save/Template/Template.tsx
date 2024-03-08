import TopPageContainer from "@/components/TopPageContainer/TopPageContainer";
import SaveProvider from "@/context/Save.context";
import React, { ReactNode } from "react";
import AllAccounts from "../AllAccounts/AllAccounts";

export const metadata = {
  title: "Securd - Save",
};

type Props = {
  children: ReactNode;
};

const Template = ({ children }: Props) => {
  return (
    <SaveProvider>
      <TopPageContainer>{children}</TopPageContainer>
      <AllAccounts />
    </SaveProvider>
  );
};

export default Template;
