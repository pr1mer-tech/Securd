import Card from "@/components/Card/Card";
import Title from "@/components/Title/Title";
import React, { FC, useContext, useMemo } from "react";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  securdFormat,
  toFormattedPercentage,
} from "@/utils/helpers/numberFormat.helpers";
import {
  TableTextType,
  TextAlignment,
  TooltipPosition,
} from "@/utils/types/enums";
import {
  APYLabelWrapper,
  CardTable,
  ColorCirle,
  DexLinkWrapper,
  LiquidationRiskData,
  MainColCell,
  PairAccountCardHeader,
  PairTitleWrapper,
  RowedCell,
  TitleCell,
  FirstColumnTable,
  LastColumnsTable,
  ConvertedLabel,
} from "./PairAccountCard.styled";
import {
  getBorrowAPY,
  getColor,
  getPairBorrowApy,
  getPairPrice,
  getPairReservesInfos,
  getTokensSymbol,
  getTotalApy,
} from "../../../../utils/helpers/borrow.helpers";
import TableText from "@/components/TableText/TableText";
import CryptoSerie from "@/components/CryptoSerie/CryptoSerie";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import DexLink from "./DexLink/DexLink";
import UniswapLogo from "../../../../assets/logos/Uniswap-logo.svg";
import {
  BorrowPoolsApy,
  CollateralInfos,
  PairReservesInfos,
} from "@/utils/types/farm.types";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import usePairBorrowBalances from "@/utils/hooks/usePairBorrowBalances";
import { FarmContext } from "@/context/Farm.context";
import { MainContext } from "@/context/Main.context";
import { getPoolAPY } from "@/utils/helpers/lenderPool.helpers";
import useBorrowerLt from "@/utils/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";

type PairAccountCardProps = {
  onClick?: () => void;
  collateralInfos: CollateralInfos;
};

const PairAccountCard: FC<PairAccountCardProps> = ({
  onClick,
  collateralInfos,
}) => {
  const tokens = useMemo(() => {
    return getTokensSymbol(collateralInfos);
  }, [collateralInfos]);

  const poolName = useMemo(() => {
    return collateralInfos.symbol;
  }, [collateralInfos]);

  const { reservesInfo } = useContext(FarmContext);
  const { coinPrices } = useContext(MainContext);

  const { collateralAmount, collateralValue, collateralFactor } =
    useCollateralAmountPrice(collateralInfos.addressLP);

  const collateralAmountDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralAmount, 18);
  }, [collateralAmount]);

  const { borrowerLT } = useBorrowerLt(collateralInfos?.addressLP);

  const balanceLT: number | undefined = useMemo(() => {
    return bigIntToDecimal(borrowerLT, 18);
  }, [borrowerLT]);

  const borrowerCF = useMemo(() => {
    return bigIntToDecimal(collateralFactor, 18);
  }, [collateralFactor]);

  const collateralValueDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralValue, 18);
  }, [collateralValue]);

  const pairReservesInfos: PairReservesInfos = useMemo(() => {
    return getPairReservesInfos(reservesInfo, tokens);
  }, [collateralInfos, tokens]);

  const assetsIcons = useMemo(
    () => [
      pairReservesInfos.reserveInfoTokenA?.imgSrc || "",
      pairReservesInfos.reserveInfoTokenB?.imgSrc || "",
    ],
    [pairReservesInfos]
  );

  const { borrowBalances } = usePairBorrowBalances(
    collateralInfos?.addressLP,
    pairReservesInfos.reserveInfoTokenA,
    pairReservesInfos.reserveInfoTokenB
  );

  const tokensUSDPrices = useMemo(() => {
    return getPairPrice(coinPrices, reservesInfo, tokens);
  }, [reservesInfo, tokens, coinPrices]);

  const loanAUSD = useMemo(() => {
    if (borrowBalances?.borrowBalanceA && tokensUSDPrices.tokenA) {
      return borrowBalances.borrowBalanceA * tokensUSDPrices.tokenA;
    }
  }, [borrowBalances, tokensUSDPrices]);

  const loanBUSD = useMemo(() => {
    if (borrowBalances?.borrowBalanceB && tokensUSDPrices.tokenB) {
      return borrowBalances.borrowBalanceB * tokensUSDPrices.tokenB;
    }
  }, [borrowBalances, tokensUSDPrices]);

  const colorRisk = useMemo(() => {
    if (borrowerCF && balanceLT) return (borrowerCF / balanceLT - 1) * 100;
  }, [balanceLT, borrowerCF]);

  const lpApr = 0.089;

  const lpApy = useMemo(() => {
    return getPoolAPY(undefined, lpApr);
  }, [lpApr]);

  const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB }: BorrowPoolsApy =
    getPairBorrowApy(reservesInfo, tokens);

  const borrowApy = useMemo(() => {
    return getBorrowAPY(
      tokensUSDPrices,
      borrowPoolAPYA,
      borrowPoolAPYB,
      borrowBalances?.borrowBalanceA,
      borrowBalances?.borrowBalanceB
    );
  }, [borrowBalances, borrowPoolAPYA, borrowPoolAPYB, tokensUSDPrices]);

  const totalApy = useMemo(() => {
    const priceLoan = (loanAUSD || 0) + (loanBUSD || 0);

    return getTotalApy(collateralValueDecimal, lpApy, priceLoan, borrowApy);
  }, [collateralValueDecimal, lpApy, loanAUSD, loanBUSD, borrowApy]);

  return (
    <Card onClick={onClick}>
      <PairAccountCardHeader>
        <PairTitleWrapper>
          <CryptoSerie cryptos={assetsIcons} />
          <div>
            <TableText type={TableTextType.TITLE} label={poolName} />
            <div>
              <DexLink label="Uniswap v2" to="#" icon={UniswapLogo} />
            </div>
          </div>
        </PairTitleWrapper>
        <APYLabelWrapper>
          <Title
            priority={4}
            label={
              <Tooltip title="Farming APY">
                Current yield of the position (Collateral - Loan) for this
                account
              </Tooltip>
            }
          />
          <Title
            priority={2}
            label={toFormattedPercentage(totalApy, 1)}
            color={getColor(totalApy)}
            fontWeight={900}
          />
        </APYLabelWrapper>
      </PairAccountCardHeader>
      <CardTable borderBottom>
        <tbody>
          <tr>
            <TitleCell>
              <Tooltip title="Collateral">
                Value of locked assets backing your loans in this account
              </Tooltip>
            </TitleCell>
          </tr>
          <tr>
            <FirstColumnTable>
              <PairTitleWrapper gap="0">
                <CryptoSerie cryptos={assetsIcons} width={24} height={24} />
                <div>
                  <TableText type={TableTextType.BODY} label={poolName} />
                  <DexLinkWrapper>
                    <DexLink label="Uniswap v2" to="#" icon={UniswapLogo} />
                  </DexLinkWrapper>
                </div>
              </PairTitleWrapper>
            </FirstColumnTable>
            <LastColumnsTable>
              <TableText
                type={TableTextType.TITLE}
                label={`${securdFormat(collateralAmountDecimal, 2)}`}
              />
            </LastColumnsTable>
            <LastColumnsTable>
              <ConvertedLabel before>
                {`$(${securdFormat(collateralValueDecimal)})`}
              </ConvertedLabel>
            </LastColumnsTable>
          </tr>
        </tbody>
      </CardTable>
      <CardTable borderBottom>
        <tbody>
          <tr>
            <TitleCell>
              <Tooltip title="Loan">Value of loans in this account</Tooltip>
            </TitleCell>
          </tr>
          <tr>
            <MainColCell align={TextAlignment.LEFT}>
              <CryptoLogo
                crypto={pairReservesInfos.reserveInfoTokenA?.imgSrc || ""}
                width={24}
                height={24}
              />
              <Title priority={4} label={tokens[0] || ""} />
            </MainColCell>
            <LastColumnsTable>
              <TableText
                type={TableTextType.TITLE}
                label={`(${securdFormat(borrowBalances?.borrowBalanceA, 2)})`}
              />
            </LastColumnsTable>
            <LastColumnsTable>
              <ConvertedLabel before>
                {`$(${securdFormat(loanAUSD)})`}
              </ConvertedLabel>
            </LastColumnsTable>
          </tr>
          <tr>
            <MainColCell align="left">
              <CryptoLogo
                crypto={pairReservesInfos.reserveInfoTokenB?.imgSrc || ""}
                width={24}
                height={24}
              />
              <Title priority={4} label={tokens[1] || ""} />
            </MainColCell>
            <td>
              <TableText
                type={TableTextType.TITLE}
                label={`(${securdFormat(borrowBalances?.borrowBalanceB, 2)})`}
              />
            </td>
            <td>
              <ConvertedLabel before>
                {`$(${securdFormat(loanBUSD, 0)})`}
              </ConvertedLabel>
            </td>
          </tr>
        </tbody>
      </CardTable>
      <CardTable>
        <tbody>
          <tr>
            <TitleCell colSpan={2}>
              <RowedCell>
                <div>Liquidation Risk</div>
                <ColorCirle colorRisk={colorRisk} />
              </RowedCell>
            </TitleCell>
          </tr>
          <tr>
            <MainColCell align="left">
              <Title
                priority={4}
                label={
                  <Tooltip
                    title="Collateral Factor"
                    position={TooltipPosition.RIGHT}
                  >
                    Collateral value divided by Loan value
                  </Tooltip>
                }
              />
            </MainColCell>
            <LiquidationRiskData>{`${
              borrowerCF !== Infinity
                ? toFormattedPercentage(borrowerCF, 1)
                : "--"
            }`}</LiquidationRiskData>
          </tr>
          <tr>
            <MainColCell align="left">
              <Title
                priority={4}
                label={
                  <Tooltip
                    title="Liquidation Threshold"
                    position={TooltipPosition.RIGHT}
                  >
                    Minimum Collateral Factor before your collateral is
                    liquidated
                  </Tooltip>
                }
              />
            </MainColCell>
            <LiquidationRiskData>{`${toFormattedPercentage(
              balanceLT,
              1
            )}`}</LiquidationRiskData>
          </tr>
        </tbody>
      </CardTable>
    </Card>
  );
};

export default PairAccountCard;
