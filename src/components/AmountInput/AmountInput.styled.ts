import { FarmActionMode } from "@/utils/types/enums";
import styled from "styled-components";

export const AmountInputWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.securdGrey};
  border-radius: 6px;
`;

export const AssetWrapper = styled.div<{
  activeAction: FarmActionMode;
}>`
  display: flex;
  flex-direction: ${(props) =>
    props.activeAction === FarmActionMode.BORROW && "column"};
  gap: ${(props) => props.activeAction !== FarmActionMode.BORROW && "0.5rem"};
  padding: 0.5rem 1rem;
  align-items: center;
  border-right: 1px solid ${(props) => props.theme.colors.securdGrey};
`;

export const AssetWrapperOnly = styled.div<{
  tokenSelectection?: boolean;
  marginTop?: string;
}>`
  display: ${(props) => (props.tokenSelectection === false ? "none" : "flex")};
  padding-top: ${(props) =>
    props.tokenSelectection === true && props.marginTop};
  align-items: center;
  gap: 0.5rem;
  :hover {
    cursor: pointer;
  }
`;

export const Input = styled.input`
  width: 100%;
  height: 2rem;
  border: none;
  outline: none;
  padding-left: 0.5rem;
  font-family: inherit;
  font-size: 14px;
`;

export const ChoiceToken = styled.div``;
