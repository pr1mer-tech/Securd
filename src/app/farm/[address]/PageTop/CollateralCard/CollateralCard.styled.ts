"use client";
import styled from "styled-components";

export const ProgressBarWrapper = styled.div`
  width: 100%;
  padding: 3rem 1.5rem 2rem 1.5rem;
`;

export const StepWrapperLT = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  margin-right: 3px;
  position: absolute;
  top: 0;
  transform: translateY(-20%);
`;
export const StepWrapperCF = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  margin-right: 3px;
  position: absolute;
  bottom: 0;
  transform: translateY(20%);
`;

export const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

export const StepMark = styled.div`
  width: 4px;
  height: 25px;
  background-color: black;
`;
