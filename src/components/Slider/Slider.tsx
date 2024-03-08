"use client";
import React, { FC, useMemo } from "react";
import ReactSlider from "react-slider";
import { getMarks } from "@/utils/helpers/slider.helpers";
import { LabelsWrapper, OffsetLabel, SliderWrapper } from "./Slider.styled";

type SliderProps = {
  max?: number;
  min?: number;
  onChange?: (value: SliderValue) => void;
  percentage?: boolean;
  width?: string;
  value?: number;
  onActualChange?: (value: number) => void;
};

export type SliderValue = {
  index: number;
  value: number;
};

const Slider: FC<SliderProps> = ({
  max,
  min,
  onChange,
  onActualChange = undefined,
  percentage = true,
  width,
  value = undefined,
}) => {
  const marks = useMemo(() => getMarks(min || 0, max || 100), [min, max]);
  return (
    <SliderWrapper width={width}>
      <ReactSlider
        value={value}
        onChange={onActualChange}
        className="horizontal-slider"
        marks={marks.map((value) => {
          return value.index;
        })}
        min={0}
        max={4}
        step={1}
        thumbClassName="thumb"
        trackClassName="track"
        markClassName="mark"
        onAfterChange={(selectedValue: number) => {
          let currentValue = marks.filter(
            (mark) => mark.index === selectedValue
          );
          onChange && onChange(currentValue[0]);
        }}
      />
      <LabelsWrapper>
        {marks.map((mark: any) => (
          <OffsetLabel key={mark.value}>{`${mark.value + (percentage ? "%" : "x")
            }`}</OffsetLabel>
        ))}
      </LabelsWrapper>
    </SliderWrapper>
  );
};

export default Slider;
