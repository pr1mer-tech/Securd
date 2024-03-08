"use client";
import React, { FC, useContext, useMemo } from "react";
import { getSavingApy } from "@/utils/helpers/lenderPool.helpers";
import { main } from "@/app/styles/theme.styled";
import Card from "@/components/Card/Card";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import Title from "@/components/Title/Title";
import {
  CardHeader,
  CyrptoHeader,
  SavingsHeader,
  SavingsLabel,
} from "./AccountCard.styled";
import { Coins, ReserveInfo } from "@/utils/types/save.types";
import Tooltip from "@/components/Tooltip/Tooltip";
import CardNotOwned from "./CardNotOwned/CardNotOwned";
import CardOwned from "./CardOwned/CardOwned";
import { toFormattedPercentage } from "@/utils/helpers/numberFormat.helpers";
import { MainContext } from "@/context/Main.context";

type AccountCardProps = {
  reserveInfo: ReserveInfo;
  poolAPY?: number;
  owned?: boolean;
  onClick?: () => void;
};

const AccountCard: FC<AccountCardProps> = ({ reserveInfo, poolAPY, owned, onClick }) => {
  const { coinPrices } = useContext(MainContext);

  const price = useMemo(() => {
    return coinPrices[reserveInfo.symbol as keyof Coins];
  }, [reserveInfo, coinPrices]);

  return (
    <Card borderColor={main.colors.securdLightGrey} onClick={onClick}>
      <CardHeader owned={owned}>
        <CyrptoHeader data-test-id="save-grid-card-label">
          <CryptoLogo crypto={reserveInfo.imgSrc} width={40} height={40} />
          <Title priority={2} label={reserveInfo.symbol} />
        </CyrptoHeader>
        {owned && (
          <SavingsHeader>
            <SavingsLabel>
              <Tooltip title="Saving APY">
                Current yield for this account
              </Tooltip>
            </SavingsLabel>

            <Title
              priority={2}
              label={`${toFormattedPercentage(poolAPY, 1)} `}
              margin="0 0.2rem"
            />
          </SavingsHeader>
        )}
      </CardHeader>
      {owned ? (
        <CardOwned reserveInfo={reserveInfo} price={price} />
      ) : (
        <CardNotOwned
          price={price}
          poolAPY={poolAPY}
          reserveInfo={reserveInfo}
        />
      )}
    </Card>
  );
};

export default AccountCard;
