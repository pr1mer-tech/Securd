"use client";
import React, { FC, useContext, useEffect, useMemo } from "react";
import { FarmContext } from "@/context/Farm.context";
import { MainContext } from "@/context/Main.context";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import {
  RowedCellBody,
  Table,
  TableBodyCell,
  TableHeaderCell,
  TableRow,
} from "../PageTop.styled";
import {
  ConvertedLabel,
  DataWrapper,
  PairLabel,
  PairWrapper,
} from "./PositionCard.styled";
import DexLink from "@/components/DexLink/DexLink";
import UniswapLogo from "../../../../../assets/uniswap-logo.svg";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  securdFormat,
  securdFormatFloor,
} from "@/utils/helpers/numberFormat.helpers";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import useGetCollateralProportions from "@/utils/hooks/wagmiSH/viewFunctions/farm/useGetCollateralProportions";

type PositionCardProps = {
  setTotalPositionLabel: (position: number) => void;
};

const PositionCard: FC<PositionCardProps> = ({ setTotalPositionLabel }) => {
  const { windowWidth } = useContext(MainContext);
  const {
    assetsIcons,
    tokens,
    pairReservesInfos,
    tokensUSDPrices,
    selectedCollateralInfo,
    collateralAmount,
    collateralValue,
    borrowBalances,
  } = useContext(FarmContext);

  const { amounts } = useGetCollateralProportions(
    selectedCollateralInfo?.addressLP,
    collateralAmount
  );

  const amountTokenA: number | undefined = useMemo(() => {
    return bigIntToDecimal(
      amounts?.tokenA,
      pairReservesInfos.reserveInfoTokenA?.decimals
    );
  }, [amounts, pairReservesInfos]);

  const amountTokenB: number | undefined = useMemo(() => {
    return bigIntToDecimal(
      amounts?.tokenB,
      pairReservesInfos.reserveInfoTokenB?.decimals
    );
  }, [amounts, pairReservesInfos]);

  const collateralAUSD = useMemo(() => {
    if (amountTokenA && tokensUSDPrices.tokenA) {
      return amountTokenA * tokensUSDPrices.tokenA;
    }
  }, [amountTokenA, tokensUSDPrices]);

  const collateralBUSD = useMemo(() => {
    if (amountTokenB && tokensUSDPrices.tokenB) {
      return amountTokenB * tokensUSDPrices.tokenB;
    }
  }, [amountTokenB, tokensUSDPrices]);

  const collateralAmountDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralAmount, 18);
  }, [collateralAmount]);

  const collateralValueDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralValue, 18);
  }, [collateralValue]);

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

  useEffect(() => {
    if (collateralValueDecimal && loanAUSD && loanBUSD)
      setTotalPositionLabel(collateralValueDecimal - (loanAUSD + loanBUSD));
  }, [loanAUSD, loanBUSD, collateralValueDecimal]);

  return (
    <Table>
      <thead>
        <TableRow borderBottom>
          <TableHeaderCell borderRight>Asset</TableHeaderCell>
          <TableHeaderCell borderRight>
            <RowedCellBody>
              <PairWrapper>
                {windowWidth > 500 && (
                  <CryptoLogo crypto={assetsIcons[0]} width={24} height={24} />
                )}
                {windowWidth > 500 && (
                  <CryptoLogo crypto={assetsIcons[1]} width={24} height={24} />
                )}
              </PairWrapper>
              <div>
                <PairLabel>{selectedCollateralInfo?.symbol}</PairLabel>
                <DexLink label={"Uniswap v2"} to={"#"} icon={UniswapLogo} />
              </div>
            </RowedCellBody>
          </TableHeaderCell>
          <TableHeaderCell borderRight>
            <RowedCellBody>
              {windowWidth > 500 && (
                <CryptoLogo crypto={assetsIcons[0]} width={24} height={24} />
              )}
              <PairLabel>{tokens[0] || "--"}</PairLabel>
            </RowedCellBody>
          </TableHeaderCell>
          <TableHeaderCell>
            <RowedCellBody>
              {windowWidth > 500 && (
                <CryptoLogo crypto={assetsIcons[1]} width={24} height={24} />
              )}
              <PairLabel>{tokens[1] || "--"}</PairLabel>
            </RowedCellBody>
          </TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow borderBottom>
          <TableHeaderCell borderRight>
            <Tooltip title="Collateral" textCentered={true}>
              Value of locked assets backing your loans in this account
            </Tooltip>
          </TableHeaderCell>

          <TableBodyCell borderRight>
            <RowedCellBody>
              <DataWrapper>
                <div>{securdFormat(collateralAmountDecimal, 2)}</div>
                <ConvertedLabel before>
                  {"$" + securdFormat(collateralValueDecimal, 0)}
                </ConvertedLabel>
              </DataWrapper>
            </RowedCellBody>
          </TableBodyCell>

          <TableBodyCell borderRight>
            <RowedCellBody>
              <DataWrapper>
                <div>{securdFormatFloor(amountTokenA, 2)}</div>
                <ConvertedLabel before>
                  {"$" + securdFormatFloor(collateralAUSD, 0)}
                </ConvertedLabel>
              </DataWrapper>
            </RowedCellBody>
          </TableBodyCell>

          <TableBodyCell>
            <RowedCellBody>
              <DataWrapper>
                <div>{securdFormatFloor(amountTokenB, 2)}</div>
                <ConvertedLabel before>
                  {"$" + securdFormatFloor(collateralBUSD, 0)}
                </ConvertedLabel>
              </DataWrapper>
            </RowedCellBody>
          </TableBodyCell>
        </TableRow>

        <TableRow>
          <TableHeaderCell borderRight>
            <Tooltip title="Loan" textCentered={true}>
              Value of loans in this account
            </Tooltip>
          </TableHeaderCell>
          <TableBodyCell borderRight background="#f0f0f0" />

          <TableBodyCell borderRight>
            <RowedCellBody>
              <DataWrapper>
                <div>{`(${securdFormatFloor(
                  borrowBalances?.borrowBalanceA,
                  2
                )})`}</div>
                <ConvertedLabel before>
                  {`($${securdFormatFloor(loanAUSD, 0)})`}
                </ConvertedLabel>
              </DataWrapper>
            </RowedCellBody>
          </TableBodyCell>

          <TableBodyCell>
            <RowedCellBody>
              <DataWrapper>
                <div>{`(${securdFormatFloor(
                  borrowBalances?.borrowBalanceB,
                  2
                )})`}</div>
                <ConvertedLabel before>
                  {`($${securdFormatFloor(loanBUSD, 0)})`}
                </ConvertedLabel>
              </DataWrapper>
            </RowedCellBody>
          </TableBodyCell>
        </TableRow>
      </tbody>
    </Table>
  );
};

export default PositionCard;
