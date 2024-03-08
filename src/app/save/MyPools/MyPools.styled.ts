"use client";
import styled from "styled-components";

export const ShowHideButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin: 2rem 0;
`;

export const NoPoolMessage = styled.div`
  text-align: center;
  margin-top: 150px;

  @media only screen and (max-width: 800px) {
    margin-top: 50px;
  }
`;
