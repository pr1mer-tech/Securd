import styled from "styled-components";

export const ConnectWalletWrapper = styled.div`
  position: relative;
`;

export const DisonnectButton = styled.button`
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  color: ${(props) => props.theme.colors.securdWhite};
`;

export const CollapseWrapper = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  width: 100%;

  .ReactCollapse--collapse {
    transition: height 500ms;
  }

  @media only screen and (max-width: 800px) {
    display: none;
  }
`;

export const DisconnectBtnWrapper = styled.div`
  background-color: ${(props) => props.theme.colors.securdPrimary};
  width: 100%;
  height: 35px;
  border-radius: 0px 0px 6px 6px;
`;
