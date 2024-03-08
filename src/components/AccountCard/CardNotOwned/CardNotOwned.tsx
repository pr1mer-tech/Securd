import React, { FC, useMemo } from "react";
import ConvertedPriceLabel from "@/components/ConvertedPriceLabel/ConvertedPriceLabel";
import { getDepositBalance } from "@/utils/helpers/lenderPool.helpers";
import {
  AccountStat,
  AccountStatLabel,
  NotOwnedWrapper,
  SavingPct,
} from "./CardNotOwned.styled";
import { securdFormat } from "@/utils/helpers/numberFormat.helpers";
import { getFloor } from "@/utils/helpers/main.helpers";
import { ReserveInfo } from "@/utils/types/save.types";

type Props = {
  price: number;
  reserveInfo: ReserveInfo;
  poolAPY: any;
};

const CardNotOwned: FC<Props> = ({ price, reserveInfo, poolAPY }) => {
  const poolSize = useMemo(() => getDepositBalance(reserveInfo), [reserveInfo]);

  const poolSizeFormatted = useMemo(() => {
    return getFloor(poolSize, 2);
  }, [poolSize]);

  const poolApyFormatted = useMemo(() => {
    return getFloor(poolAPY, 2);
  }, [poolAPY]);

  return (
    <NotOwnedWrapper>
      <div>
        <AccountStatLabel>Pool Size</AccountStatLabel>
        <AccountStat>{securdFormat(poolSizeFormatted)}</AccountStat>
        <ConvertedPriceLabel amount={poolSize} price={price} />
      </div>
      <div>
        <AccountStatLabel>Saving APY</AccountStatLabel>
        <SavingPct>{`${securdFormat(poolApyFormatted)}`}</SavingPct>
      </div>
    </NotOwnedWrapper>
  );
};

export default CardNotOwned;
