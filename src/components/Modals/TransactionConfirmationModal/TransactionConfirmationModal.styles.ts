import styled from "styled-components";

export const ModalWrapper = styled.div`
  display: flex;
  align-items: stretch;
`;

export const ModalSection = styled.div<{
  bordered?: boolean;
}>`
  flex: 1;
  padding: 1rem;
  border-right: ${(props) =>
    props.bordered
      ? `1px solid ${props.theme.colors.securdLightGrey}`
      : "none"};
`;

export const SectionTitle = styled.div`
  width: 100%;
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.colors.securdLightGrey};
  font-size: 18px;
`;

export const DetailItem = styled.div<{
  bordered?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-top: ${(props) =>
    props.bordered
      ? `1px solid ${props.theme.colors.securdLightGrey}`
      : "none"};
  font-size: 400;
`;

export const PriceLabelWrapper = styled.div`
  text-align: right;

  & > div:first-of-type {
    font-size: 18px;
    font-weight: 500;
  }

  & > div:last-of-type {
    color: ${(props) => props.theme.colors.securdGrey};
  }
`;

export const ImpactRow = styled.div<{
  bordered?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: ${(props) =>
    props.bordered
      ? `1px solid ${props.theme.colors.securdLightGrey}`
      : "none"};
`;

export const ModalBottomCard = styled.div`
  background: rgba(224, 224, 224, 0.5);
  border: 1px solid rgba(144, 160, 176, 0.5);
  margin-top: 0.5rem;
  border-radius: 3px;
  padding: 0.3rem 0.7rem;
`;

export const FigureRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LoanLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
`;
