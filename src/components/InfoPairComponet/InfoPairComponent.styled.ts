"use client";
import styled from "styled-components";

export const InfoPairContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

export const TitlePairInfo = styled.span<{ fontSize?: string }>`
  color: #000;
  font-family: Inter;
  font-size: ${(props) => (props.fontSize ? props.fontSize : "14px")};
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;
