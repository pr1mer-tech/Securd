import React, { FC } from "react";
import NoSSR from "../NoSSR/NoSSR";

type CryptoLogoProps = {
  crypto: string;
  width: number;
  height: number;
};

const CryptoLogo: FC<CryptoLogoProps> = ({ crypto, width, height }) => {
  return (
    <NoSSR>
      <img alt="cryptologo" src={crypto} width={width} height={height} />
    </NoSSR>
  );
};

export default CryptoLogo;
