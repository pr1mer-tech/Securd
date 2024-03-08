import { TableTextType } from "@/utils/types/enums";
import styled from "styled-components";

export const Text = styled.div<{
  color?: string;
  type: TableTextType;
}>`
  font-weight: ${(props) =>
    props.type === TableTextType.TITLE ? "500" : "400"};
  font-size: ${(props) =>
    props.type === TableTextType.EMPHASIS
      ? "21px"
      : props.type === TableTextType.TITLE
      ? "15px"
      : props.type === TableTextType.BODY
      ? "14px"
      : "1.35rem"};
  color: ${(props) => props.color || "inherit"};
`;
