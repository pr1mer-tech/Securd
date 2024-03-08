"use client";
import styled from "styled-components";

export const ModalWrapper = styled.div`
  position: fixed;
  inset: 0px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(31 41 55 / 0.75);
  padding: 1rem;
`;

export const ModalBody = styled.div<{
  width?: string;
}>`
  position: relative;
  border-radius: 0.5rem;
  border-width: 1px solid rgb(38 36 33 / 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  background-color: ${(props) => props.theme.colors.securdWhite};
  min-width: ${(props) => props.width || "200px"};
  min-height: 150px;
`;

export const ModalHeader = styled.div`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.securdBlack};
`;

export const CloseButton = styled.button`
  border: none;
  background: none;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 0.2rem;
  right: 0.5rem;
`;

export const ModalFooter = styled.div`
  border-top: 1px solid ${(props) => props.theme.colors.securdLightGrey};
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;

  & > button {
    flex: 1;
  }
`;
