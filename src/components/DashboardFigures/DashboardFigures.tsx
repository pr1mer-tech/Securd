import React, { FC, ReactNode } from "react";
import ConvertedPriceLabel from "../ConvertedPriceLabel/ConvertedPriceLabel";
import {
  ConvertedWrapper,
  DashboardWrapper,
  FigureWrapper,
  StatLabel,
  StatWrapper,
} from "./DashboardFigures.styled";

type DashboardData = {
  title: string | ReactNode;
  value: string;
  convertedValue?: number;
};

type DashboardFiguresProps = {
  breakpoint?: string;
  data: DashboardData[];
  maxItemWidth?: string;
  coinPrices?: number;
};

const DashboardFigures: FC<DashboardFiguresProps> = ({
  breakpoint,
  data,
  maxItemWidth,
  coinPrices,
}) => {
  const convertedAlignment = data.some((item) => item.convertedValue);

  return (
    <DashboardWrapper breakpoint={breakpoint}>
      {data.map((item: DashboardData, key: number) => (
        <StatWrapper key={key} breakpoint={breakpoint} itemWidth={maxItemWidth}>
          <StatLabel>{item.title}</StatLabel>
          <FigureWrapper>{item.value}</FigureWrapper>
          {item.convertedValue !== undefined && (
            <ConvertedWrapper>
              <ConvertedPriceLabel
                amount={item.convertedValue}
                price={coinPrices}
              />
            </ConvertedWrapper>
          )}
          {item.convertedValue === undefined && convertedAlignment && (
            <ConvertedWrapper>&nbsp;</ConvertedWrapper>
          )}
        </StatWrapper>
      ))}
    </DashboardWrapper>
  );
};

export default DashboardFigures;
