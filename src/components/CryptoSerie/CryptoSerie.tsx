import React, { FC } from "react";
import CryptoLogo from "../CryptoLogo/CryptoLogo";
import { CryptoAmount, LogoWrapper, Serie } from "./CryptoSerie.styled";

type CryptoSerieProps = {
  cryptos: string[];
  cryptoAmount?: number;
  width?: number;
  height?: number;
};

const CryptoSerie: FC<CryptoSerieProps> = ({
  cryptos,
  cryptoAmount,
  width,
  height,
}) => {
  return (
    <Serie>
      {cryptos
        ?.map((crypto, key) => {
          return (
            <LogoWrapper zIndex={30 - key} key={key}>
              <CryptoLogo
                crypto={crypto}
                width={width || 35}
                height={height || 35}
              />
            </LogoWrapper>
          );
        })
        .slice(0, 4)}
      {cryptoAmount && cryptos.length > 4 ? (
        <CryptoAmount>{cryptoAmount - 4}+</CryptoAmount>
      ) : (
        ""
      )}
    </Serie>
  );
};

export default CryptoSerie;
