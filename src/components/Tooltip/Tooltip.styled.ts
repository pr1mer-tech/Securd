"use client";
import styled from "styled-components";

export const TooltipWrapper = styled.div<{
  textCentered?: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  justify-content: ${(props) => (props.textCentered === true ? "center" : "")};

  img {
    width: 16px;
    height: 16px;
  }

  .tooltip.show {
    width: fit-content;
    height: fit-content;
    padding: 10px;
    border-radius: 5px;
    opacity: 1 !important;
  }
`;
