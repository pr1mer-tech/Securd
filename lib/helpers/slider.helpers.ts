import { SliderValue } from "@/components/Slider/Slider";

export const getMarks = (min: number, max: number) => {
  const marks: SliderValue[] = [];
  const step = (max - min) / 4;

  marks.push({ index: 0, value: min });
  marks.push({ index: 1, value: Number((min + step).toFixed(1)) });
  marks.push({ index: 2, value: Number((min + step * 2).toFixed(1)) });
  marks.push({ index: 3, value: Number((min + step * 3).toFixed(1)) });
  marks.push({ index: 4, value: Number(max.toFixed(1)) });
  return marks;
};

export const getMarksV2 = (min: number, max: number) => {
  const marks: number[] = [];
  const step = (max - min) / 4;

  marks.push(min);
  marks.push(Number((min + step).toFixed(1)));
  marks.push(Number((min + step * 2).toFixed(1)));
  marks.push(Number((min + step * 3).toFixed(1)));
  marks.push(Number(max.toFixed(1)));

  return marks;
};
