"use client";
import React, { FC } from "react";
import { MessageLabel } from "./ErrorMessage.styled";

type ErrorMessageProps = {
  show: boolean;
  message: string;
};

const ErrorMessage: FC<ErrorMessageProps> = ({ show, message }) => {
  return <>{show && <MessageLabel>{message}</MessageLabel>}</>;
};

export default ErrorMessage;
