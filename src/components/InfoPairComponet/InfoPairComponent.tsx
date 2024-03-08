import React, { useMemo } from "react";
import DexLink from "../DexLink/DexLink";
import CryptoSerie from "../CryptoSerie/CryptoSerie";
import { InfoPairContainer, TitlePairInfo } from "./InfoPairComponent.styled";

type InfoPairProps = {
  scale: number;
  assetsIconList: Array<string>;
  tokensList: Array<string>;
  dexIcon: string;
  fontSize?: string;
};
const InfoPairComponent = ({
  scale,
  assetsIconList,
  tokensList,
  dexIcon,
  fontSize,
}: InfoPairProps) => {
  const fullLpName = useMemo(() => {
    if (tokensList.length > 1) return tokensList[0] + "/" + tokensList[1];
  }, [tokensList]);

  return (
    <InfoPairContainer>
      <CryptoSerie height={20} width={20} cryptos={assetsIconList} />
      <div>
        <TitlePairInfo fontSize={fontSize}>
          {fullLpName ? fullLpName : "--"}
        </TitlePairInfo>
        <div>
          <DexLink
            scale={scale}
            label="Uniswap v2"
            to="#"
            icon={dexIcon}
            transformOrigin="left"
          />
        </div>
      </div>
    </InfoPairContainer>
  );
};

export default InfoPairComponent;
