"use client";
import React, { FC, useState } from "react";
import { ChoiceTabWrapper, Tab } from "./ChoiceTab.styled";
import Image from "next/image";

type ChoiceTabProps = {
  active?: number;
  activeColor?: string;
  backgroundColor?: string;
  icons?: boolean;
  mobileHide?: boolean;
  onChange?: (activeTab: number) => void;
  tabs: string[];
};

const ChoiceTab: FC<ChoiceTabProps> = ({
  active,
  activeColor,
  backgroundColor,
  icons,
  mobileHide,
  onChange,
  tabs,
}) => {
  const [activeTab, setActiveTab] = useState<number | undefined>(active);

  return (
    <ChoiceTabWrapper
      backgroundColor={backgroundColor}
      icons={icons}
      mobileHide={mobileHide}
    >
      {tabs.map((tab: string, key: number) => {
        return (
          <Tab
            active={activeTab === key}
            key={key}
            onClick={() => {
              setActiveTab(key);
              onChange && onChange(key);
            }}
            activeColor={activeColor}
            icons={icons}
          >
            {icons ? <Image src={tab} alt="icon" /> : tab}
          </Tab>
        );
      })}
    </ChoiceTabWrapper>
  );
};

export default ChoiceTab;
