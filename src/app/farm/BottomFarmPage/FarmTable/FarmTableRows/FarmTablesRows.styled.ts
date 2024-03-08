import styled from "styled-components";

export const CryptosColumn = styled.div`
  display: flex;
  flex-direction: column;

  & img:first-child {
    z-index: 2;
    margin-bottom: -0.5rem;
  }

  @media only screen and (max-width: 800px) {
    display: none;
  }
`;

export const AccountCell = styled.td`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AccountBasicsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
