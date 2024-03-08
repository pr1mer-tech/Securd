import React, { FC, useContext, useEffect, useState } from "react";
import {
  getBorrowAPYLP,
  getBorrowerPoolBalanceLT,
  getBorrowerPoolMaxLeverage,
  getFormattedPoolName,
  getMaxLT,
  getMaxLpApy,
  getPairBorrowApy,
  getPairReservesInfos,
  getTokensSymbol,
} from "@/utils/helpers/borrow.helpers";
import TableRow from "@/components/TableRow/TableRow";
import { fetchBalance } from "wagmi/actions";
import {
  BorrowPoolsApy,
  CollateralInfos,
  PairReservesInfos,
} from "@/utils/types/farm.types";
import ConvertedPriceLabel from "@/components/ConvertedPriceLabel/ConvertedPriceLabel";
import { useRouter } from "next/navigation";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import TableText from "@/components/TableText/TableText";
import { TableTextType } from "@/utils/types/enums";
import { getPoolAPY } from "@/utils/helpers/lenderPool.helpers";
import { FarmContext } from "@/context/Farm.context";
import {
  securdFormat,
  toFormattedPercentage,
  toLeverage,
} from "@/utils/helpers/numberFormat.helpers";

import UniswapLogo from "../../../../../assets/logos/Uniswap-logo.svg";
import DexLink from "@/app/farm/MyFarmPairs/PairAccountCard/DexLink/DexLink";
import { MainContext } from "@/context/Main.context";
import {
  AccountBasicsWrapper,
  AccountCell,
  CryptosColumn,
} from "./FarmTablesRows.styled";
import { useConfig } from "wagmi";
import useCollateralPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralPrice";
import { ReserveInfo } from "@/utils/types/save.types";

type RowProps = {
  collateralInfos: CollateralInfos;
  tokens: string[];
  poolName?: string;
  minLT?: number;
  maxLT?: number;
  maxLeverage?: number;
  pairReservesInfos: PairReservesInfos;
  assetIcons: string[];
  borrowPoolAPYA: number | undefined;
  borrowPoolAPYB: number | undefined;
  borrowLpApy: number | undefined;
  CollateralPool: any;
  lpApr: number;
  lpApy: number | undefined;
  maxLpApy: number | undefined;
};

const Row: FC<
  RowProps & {
    reservesInfo: ReserveInfo[];
  }
> = ({
  collateralInfos,
  poolName,
  minLT,
  maxLT,
  maxLeverage,
  assetIcons,
  borrowLpApy,
  CollateralPool,
  lpApy,
  maxLpApy,
}) => {
    const { windowWidth } = useContext(MainContext);
    const router = useRouter();

    const { collateralPrice } = useCollateralPrice(collateralInfos?.addressLP);

    return (
      <TableRow
        padding={"1rem"}
        border
        onClick={() => router.push(`/farm/${collateralInfos.addressLP}`)}
      >
        <AccountCell>
          <CryptosColumn>
            <CryptoLogo crypto={assetIcons?.[0] || ""} width={30} height={30} />
            <CryptoLogo crypto={assetIcons?.[1] || ""} width={30} height={30} />
          </CryptosColumn>
          <AccountBasicsWrapper>
            <TableText type={TableTextType.TITLE} label={poolName} />
            {windowWidth > 800 && (
              <DexLink label="Uniswap v2" icon={UniswapLogo} to="#" />
            )}
          </AccountBasicsWrapper>
        </AccountCell>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${securdFormat(Number(CollateralPool?.formatted))}`}
          />
          <ConvertedPriceLabel
            amount={Number(CollateralPool?.formatted)}
            price={collateralPrice}
          />
        </td>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${toFormattedPercentage(Number(minLT), 1)}`}
          />
        </td>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${toFormattedPercentage(Number(maxLT), 1)}`}
          />
        </td>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${toLeverage(Number(maxLeverage))}`}
          />
        </td>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${toFormattedPercentage(Number(borrowLpApy), 1)}`}
          />
        </td>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${toFormattedPercentage(Number(lpApy), 1)}`}
          />
        </td>
        <td>
          <TableText
            type={TableTextType.EMPHASIS}
            label={`${toFormattedPercentage(Number(maxLpApy), 1)}`}
          />
        </td>
      </TableRow>
    );
  };

const FarmTableRows = () => {
  const { collateralsInfos, reservesInfo, sortAccounts, search } =
    useContext(FarmContext);

  const [sortedData, setSortedData] = useState<RowProps[] | undefined>(
    undefined
  );

  const config = useConfig();

  useEffect(() => {
    (async () => {
      const sortedData = collateralsInfos
        ? collateralsInfos.map(async (collateralInfos) => {
          const tokens = getTokensSymbol(collateralInfos);
          const poolName = getFormattedPoolName(collateralInfos);
          const minLT = getBorrowerPoolBalanceLT(collateralInfos);
          const maxLT = getMaxLT(collateralInfos);
          const maxLeverage = getBorrowerPoolMaxLeverage(collateralInfos);

          const pairReservesInfos: PairReservesInfos = getPairReservesInfos(
            reservesInfo,
            tokens
          );

          const assetIcons =
            pairReservesInfos &&
              pairReservesInfos.reserveInfoTokenA &&
              pairReservesInfos.reserveInfoTokenB
              ? [
                pairReservesInfos.reserveInfoTokenA.imgSrc,
                pairReservesInfos.reserveInfoTokenB.imgSrc,
              ]
              : ["", ""];

          const {
            apyA: borrowPoolAPYA,
            apyB: borrowPoolAPYB,
          }: BorrowPoolsApy = getPairBorrowApy(reservesInfo, tokens);

          const borrowLpApy =
            borrowPoolAPYA !== undefined && borrowPoolAPYB !== undefined
              ? getBorrowAPYLP(borrowPoolAPYA, borrowPoolAPYB)
              : undefined;

          const CollateralPool = await fetchBalance({
            address: collateralInfos?.address,
            token: collateralInfos?.addressLP,
          });

          // MARK: ANTHONY wanted to have this to be fixed for a demo purpose
          const lpApr = 0.089;

          const lpApy =
            lpApr !== undefined ? getPoolAPY(undefined, lpApr) : undefined;

          const maxLpApy = () => {
            if (lpApy !== undefined) {
              return getMaxLpApy(maxLeverage, borrowLpApy, lpApy);
            }
          };

          return {
            collateralInfos,
            tokens,
            poolName,
            minLT,
            maxLT,
            maxLeverage,
            pairReservesInfos,
            assetIcons,
            borrowPoolAPYA,
            borrowPoolAPYB,
            borrowLpApy,
            CollateralPool,
            lpApr,
            lpApy,
            maxLpApy: maxLpApy(),
          };
        })
        : [];
      setSortedData(await Promise.all(sortedData));
    })();
  }, [collateralsInfos, reservesInfo]);

  // Sort the data based on sortAccounts prop
  if (sortAccounts.apy) {
    sortedData?.sort((a, b) => (b.borrowLpApy ?? 0) - (a.borrowLpApy ?? 0));
  } else if (sortAccounts.poolSize) {
    sortedData?.sort((a, b) =>
      Number((b.CollateralPool?.value ?? 0n) - (a.CollateralPool?.value ?? 0n))
    );
  }

  return (
    <>
      {sortedData ?
      .filter((data) => {
        if (typeof search === "string" && search.length > 0) {
          return data.poolName.toLowerCase().includes(search.toLowerCase());
        }
        return true;
      })
          .map((data, key) => (
            <Row
              collateralInfos={data.collateralInfos}
              reservesInfo={reservesInfo}
              tokens={data.tokens}
              poolName={data.poolName}
              minLT={data.minLT}
              maxLT={data.maxLT}
              maxLeverage={data.maxLeverage}
              pairReservesInfos={data.pairReservesInfos}
              assetIcons={data.assetIcons}
              borrowPoolAPYA={data.borrowPoolAPYA}
              borrowPoolAPYB={data.borrowPoolAPYB}
              borrowLpApy={data.borrowLpApy}
              CollateralPool={data.CollateralPool}
              lpApr={data.lpApr}
              lpApy={data.lpApy}
              maxLpApy={data.maxLpApy}
              key={key}
            />
          ))}
    </>
  );
};

export default FarmTableRows;
