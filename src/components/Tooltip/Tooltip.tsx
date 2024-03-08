import React, { FC, ReactNode, useMemo } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import questionMark from "../../assets/icons/question-mark.svg";
import { TooltipWrapper } from "./Tooltip.styled";
import { main } from "@/app/styles/theme.styled";
import { TooltipPosition } from "@/utils/types/enums";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import NoSSR from "../NoSSR/NoSSR";

type TooltipProps = {
  title: string;
  children: string | ReactNode;
  position?: TooltipPosition;
  questionMarkTag?: boolean;
  textCentered?: boolean;
};

const Tooltip: FC<TooltipProps> = ({
  title,
  children,
  position,
  textCentered = false,
}) => {
  const tooltipId = useMemo(() => uuidv4(), []);

  return (
    <NoSSR>
      <TooltipWrapper textCentered={textCentered}>
        {title}
        <Image
          src={questionMark}
          data-tip="React-tooltip"
          data-for={tooltipId}
          alt="question_mark"
        />
        {
          //@ts-ignore
          <ReactTooltip
            style={{ backgroundColor: main.colors.securdGrey }}
            className="tooltip"
            id={tooltipId}
            place={position ? position : TooltipPosition.TOP}
            delayHide={100}
            float={false}
          >
            {children}
          </ReactTooltip>
        }
      </TooltipWrapper>
    </NoSSR>
  );
};

export default Tooltip;
