import TopPageContainer from "@/components/TopPageContainer/TopPageContainer";
import FarmProvider from "@/context/Farm.context";
import React, { FC, ReactNode } from "react";
import BottomFarmPage from "../BottomFarmPage/BottomFarmPage";

export const metadata = {
  title: "Securd - Farm",
};

type Props = {
  children: ReactNode;
};

const Template: FC<Props> = ({ children }) => {
  return (
    <FarmProvider>
      <TopPageContainer>{children}</TopPageContainer>
      <BottomFarmPage />
    </FarmProvider>
  );
};

export default Template;
