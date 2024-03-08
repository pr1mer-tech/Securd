import React, { FC, useMemo } from "react";
import ReactSlider from "react-slider";
import { getMarksV2 } from "../../utils/helpers/slider.helpers";
import { LabelsWrapper, OffsetLabel, SliderWrapper } from "./SliderV2.styled";

type SliderProps = {
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  percentage?: boolean;
  step?: number;
  value: number;
  width?: string;
};

const SliderV2: FC<SliderProps> = ({
  max,
  min,
  onChange,
  percentage = false,
  step,
  value,
  width,
}) => {
  const marks = useMemo(() => getMarksV2(min || 0, max || 100), [min, max]);

  return (
    <SliderWrapper width={width}>
      <ReactSlider
        className="horizontal-slider"
        marks={marks}
        min={min || 0}
        max={max || 100}
        step={step || 1}
        thumbClassName="thumb"
        trackClassName="track"
        markClassName="mark"
        value={value}
        onAfterChange={(value: number) => {
          onChange && onChange(value);
        }}
      />
      <LabelsWrapper>
        {marks.map((mark: number) => (
          <OffsetLabel key={mark}>{`${
            (mark / 10).toFixed(1) + (percentage ? "%" : "x")
          }`}</OffsetLabel>
        ))}
      </LabelsWrapper>
    </SliderWrapper>
  );
};

export default SliderV2;
