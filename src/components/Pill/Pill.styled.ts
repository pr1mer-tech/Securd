import styled from "styled-components";

export const PillWrapper = styled.div<{
  selected: boolean;
}>`
  font-weight: 500;
  font-size: 14px;
  padding: 0.3rem 0.6rem;
  border-radius: 999rem;
  color: ${(props) =>
    props.selected
      ? props.theme.colors.securdDarkBlue
      : props.theme.colors.securdBlack};
  cursor: pointer;
  background-color: ${(props) =>
    props.selected
      ? props.theme.colors.securdWhite
      : props.theme.colors.securdLightGrey};
  border: ${(props) =>
    props.selected && `2px solid ${props.theme.colors.securdDarkBlue}`};

  &:hover {
    color: ${(props) => props.theme.colors.securdWhite};
    background-color: ${(props) => props.theme.colors.securdPrimary};
  }
`;
