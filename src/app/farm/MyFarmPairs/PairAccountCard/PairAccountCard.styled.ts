import { TextAlignment } from "@/utils/types/enums";
import styled from "styled-components";

export const PairAccountCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};
`;

export const PairTitleWrapper = styled.div<{
  gap?: string;
}>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.gap || "0.5rem"};
  padding-left: 10px;
`;

export const APYLabelWrapper = styled.div`
  text-align: right;
`;

export const ProgressBarWrapper = styled.div`
  width: 100%;
  padding: 0.5rem 0;
  border-top: 1px solid ${(props) => props.theme.colors.securdLightGrey};
`;

export const CardTable = styled.table<{
  borderBottom?: boolean;
}>`
  width: 100%;
  margin: 0.5rem 0;
  text-align: center;
  border-collapse: separate;
  border-spacing: 1rem 0;
  border-bottom: ${(props) =>
    props.borderBottom
      ? `1px solid ${props.theme.colors.securdLightGrey}`
      : "none"};
  padding-bottom: ${(props) => (props.borderBottom ? "1rem" : "0")};

  & > tbody {
    width: 100%;
  }

  @media only screen and (max-width: 1200px) {
    border-spacing: none;
  }
`;

export const TitleCell = styled.td`
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.securdPrimary};
`;

export const RowedCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const ColorCirle = styled.div<{
  colorRisk?: number;
}>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.colorRisk && props.colorRisk <= 10
      ? props.theme.colors.systemRed
      : props.colorRisk && props.colorRisk <= 25
      ? props.theme.colors.systemYellow
      : props.theme.colors.systemGreen};
`;

export const MainColCell = styled.td<{
  align?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.align === TextAlignment.LEFT
      ? "flex-start"
      : props.align === TextAlignment.RIGHT
      ? "flex-end"
      : props.align === TextAlignment.CENTER
      ? "center"
      : "space-between"};
  padding: 0.3rem 0 0.3rem 1rem;

  & > div:last-child {
    text-align: ${(props) => props.align || "center"};
  }
`;

export const ProgressBarLabel = styled.div`
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 0.5rem;
`;

export const DexLinkWrapper = styled.div`
  scale: 0.7;
`;

export const LiquidationRiskData = styled.td`
  font-size: 20px;
  font-weight: 600;
  text-align: right;
`;

export const FirstColumnTable = styled.td`
  width: 55%;
`;
export const LastColumnsTable = styled.td`
  width: 22%;
`;

export const ConvertedLabel = styled.div<{
  before?: boolean;
}>`
  font-size: 14px;
  color: ${(props) => props.before && props.theme.colors.securdGrey};

  @media only screen and (max-width: 500px) {
    font-size: 12px;
  }
`;
