import React, { FC, ReactNode } from "react";
import {
  ChildrenContainer,
  FirstSection,
  SecondSection,
  SectionsContainer,
  TopMainContainer,
} from "./TopPageContainer.styled";

type TopPageContainerProps = {
  padding?: string;
  height?: string;
  mobilePadding?: string;
  children: ReactNode;
};

const TopPageContainer: FC<TopPageContainerProps> = ({
  children,
  padding,
  mobilePadding,
  height,
}) => {
  return (
    <TopMainContainer>
      <SectionsContainer>
        <FirstSection />
        <SecondSection height={height} />
      </SectionsContainer>
      <ChildrenContainer padding={padding} mobilePadding={mobilePadding}>
        {children}
      </ChildrenContainer>
    </TopMainContainer>
  );
};

export default TopPageContainer;
