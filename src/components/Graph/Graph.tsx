"use client";
import React, { FC, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Tooltip,
  CartesianGrid,
  XAxis,
  Area,
} from "recharts";
import NavigationButton from "../NavigationButton/NavigationButton";
import { ButtonsWrapper, TooltipWrapper } from "./Graph.styled";
import { main } from "@/app/styles/theme.styled";
import { GraphData } from "@/utils/types/save.types";
import { GraphPeriod } from "@/utils/types/enums";

type GraphProps = {
  series: GraphData[];
  setSelectedPeriod: Function;
  selectedPeriod: GraphPeriod;
};

const GraphTooltip = ({ active, payload }: any) => {
  if (!active) return null;
  if (!payload) return null;
  if (payload[0] === undefined) return null;

  return (
    <TooltipWrapper>
      <div>Date : {payload[0].payload.time}</div>
      <div>APY : {payload[0].payload.value}%</div>
    </TooltipWrapper>
  );
};

const Graph: FC<GraphProps> = ({
  series,
  selectedPeriod,
  setSelectedPeriod,
}) => {
  const getButtonColor = useMemo(
    () => (period: GraphPeriod) => {
      return selectedPeriod === period
        ? main.colors.securdPrimary
        : main.colors.securdGrey;
    },
    [selectedPeriod]
  );

  return (
    <div>
      <ButtonsWrapper>
        <NavigationButton
          active={selectedPeriod === GraphPeriod.DAY}
          label="Day"
          color={getButtonColor(GraphPeriod.DAY)}
          outline
          defaultOutlined
          padding="1rem 0"
          width="80px"
          onClick={() => {
            setSelectedPeriod(GraphPeriod.DAY);
          }}
        />
        <NavigationButton
          active={selectedPeriod === GraphPeriod.WEEK}
          label="Week"
          color={getButtonColor(GraphPeriod.WEEK)}
          outline
          defaultOutlined
          padding="1rem 0"
          width="80px"
          onClick={() => {
            setSelectedPeriod(GraphPeriod.WEEK);
          }}
        />
        <NavigationButton
          active={selectedPeriod === GraphPeriod.MONTH}
          label="Month"
          color={getButtonColor(GraphPeriod.MONTH)}
          outline
          defaultOutlined
          padding="1rem 0"
          width="80px"
          onClick={() => {
            setSelectedPeriod(GraphPeriod.MONTH);
          }}
        />
        <NavigationButton
          active={selectedPeriod === GraphPeriod.YEAR}
          label="Year"
          color={getButtonColor(GraphPeriod.YEAR)}
          outline
          defaultOutlined
          padding="1rem 0"
          width="80px"
          onClick={() => {
            setSelectedPeriod(GraphPeriod.YEAR);
          }}
        />
      </ButtonsWrapper>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart width={1088} height={300} data={series}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={main.colors.systemGreen}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={main.colors.systemGreen}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Tooltip content={<GraphTooltip />} />
          <CartesianGrid stroke={main.colors.securdGrey} vertical={false} />
          <XAxis stroke={main.colors.securdGrey} dataKey="time" />
          <Area
            type="monotone"
            dataKey="value"
            stroke={main.colors.systemGreen}
            strokeWidth="2px"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;
