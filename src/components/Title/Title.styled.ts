"use client";
import styled from "styled-components";

export const TitleLabel = styled.div<{
  priority: 1 | 2 | 3 | 4;
  color?: string;
  margin?: string;
  fontWeight?: number;
}>`
  font-family: ${(props) => (props.priority === 1 ? "Poppins" : "Inter")};
  font-size: ${(props) =>
    props.priority === 1
      ? "35px"
      : props.priority === 2
      ? "25px"
      : props.priority === 3
      ? "20px"
      : "17px"};
  font-weight: ${(props) =>
    props.fontWeight
      ? props.fontWeight
      : props.priority === 1 || props.priority === 2
      ? 700
      : 500};
  color: ${(props) => props.color || "black"};
  letter-spacing: ${(props) => props.priority === 1 && "-0.02em;"};
  margin: ${(props) => props.margin || "0.2rem"};
`;
