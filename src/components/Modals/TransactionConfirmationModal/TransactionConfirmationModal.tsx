import React, { useContext, useMemo } from "react";
import {
  DetailItem,
  FigureRow,
  ImpactRow,
  LoanLabel,
  ModalBottomCard,
  ModalSection,
  ModalWrapper,
  PriceLabelWrapper,
  SectionTitle,
} from "./TransactionConfirmationModal.styles";
import InfoPairComponent from "@/components/InfoPairComponet/InfoPairComponent";
import { FarmContext } from "@/context/Farm.context";
import UniswapLogo from "@/assets/logos/Uniswap-logo.svg";
import RightArrow from "@/assets/icons/right-arrow.svg";
import Image from "next/image";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import { FarmActionMode } from "@/utils/types/enums";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import {
  formatPCTFactor,
  securdFormatFloor,
} from "@/utils/helpers/numberFormat.helpers";
import useBorrowerLt from "@/utils/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";
import useGetPositionData from "@/utils/hooks/wagmiSH/viewFunctions/useGetPositionData";
import useGetTransactionDetails from "@/utils/hooks/useGetTransactionDetails";

const TransactionConfirmationModal = () => {
  const {
    activeAction,
    assetsIcons,
    borrowBalances,
    lpTokensSymbol,
    selectedCollateralInfo,
    tokensUSDPrices,
    tokens,
    transactionAmount,
  } = useContext(FarmContext);

  const {
    collateralAmount,
    collateralFactor,
    collateralValue,
    leverageFactor,
  } = useCollateralAmountPrice(selectedCollateralInfo?.addressLP);
  const { borrowerLT } = useBorrowerLt(selectedCollateralInfo?.addressLP);
  const { transactionName, positionDataParams } = useGetTransactionDetails();
  const { positionData } = useGetPositionData(positionDataParams);

  const loanAUSD = useMemo(() => {
    if (borrowBalances?.borrowBalanceA && tokensUSDPrices.tokenA)
      return borrowBalances.borrowBalanceA * tokensUSDPrices.tokenA;
  }, [borrowBalances, tokensUSDPrices]);

  const loanBUSD = useMemo(() => {
    if (borrowBalances?.borrowBalanceB && tokensUSDPrices.tokenB)
      return borrowBalances.borrowBalanceB * tokensUSDPrices.tokenB;
  }, [borrowBalances, tokensUSDPrices]);

  const formattedCF = useMemo(() => {
    const factor = bigIntToDecimal(collateralFactor, 16);
    return formatPCTFactor(factor);
  }, [collateralFactor]);

  const formattedLT = useMemo(() => {
    const lt = bigIntToDecimal(borrowerLT, 16);
    return formatPCTFactor(lt);
  }, [collateralFactor]);

  const transactionCurrency = useMemo(() => {
    return activeAction === FarmActionMode.LOCK ? lpTokensSymbol : tokens[0];
  }, [activeAction]);

  return (
    <ModalWrapper>
      <ModalSection bordered>
        <SectionTitle>Transaction Details</SectionTitle>
        <DetailItem>
          <div>{transactionName}</div>
          <PriceLabelWrapper>
            <div>
              {transactionAmount} {transactionCurrency}
            </div>
            <div>$--</div>
          </PriceLabelWrapper>
        </DetailItem>
      </ModalSection>
      <ModalSection>
        <SectionTitle>Impact on my account</SectionTitle>
        <div>
          <ImpactRow bordered>
            <InfoPairComponent
              scale={1}
              assetsIconList={assetsIcons}
              tokensList={tokens}
              dexIcon={UniswapLogo}
            />
            <FigureRow>
              <PriceLabelWrapper>
                <div>
                  {bigIntToDecimal(collateralAmount, 18)?.toFixed(2) || "--"}
                </div>
                <div>
                  {bigIntToDecimal(collateralValue, 18)?.toFixed(2) || "--"}$
                </div>
              </PriceLabelWrapper>
              <Image src={RightArrow} alt="arrow" />
              <PriceLabelWrapper>
                <div>{positionData?.collateral.toFixed(2)}</div>
                <div>{positionData?.collateralValue.toFixed(2)}$</div>
              </PriceLabelWrapper>
            </FigureRow>
          </ImpactRow>
          <ImpactRow bordered>
            <LoanLabel>
              <CryptoLogo crypto={assetsIcons[0]} width={24} height={24} />
              <div>{tokens.length > 1 && tokens[0]}</div>
            </LoanLabel>
            <FigureRow>
              <PriceLabelWrapper>
                <div>
                  {securdFormatFloor(borrowBalances?.borrowBalanceA, 2)}
                </div>
                <div>{securdFormatFloor(loanAUSD, 2)}$</div>
              </PriceLabelWrapper>
              <Image src={RightArrow} alt="arrow" />
              <PriceLabelWrapper>
                <div>{positionData?.debt0.toFixed(2)}</div>
                <div>{positionData?.debtValue0.toFixed(2)}$</div>
              </PriceLabelWrapper>
            </FigureRow>
          </ImpactRow>
          <ImpactRow bordered>
            <LoanLabel>
              <CryptoLogo crypto={assetsIcons[1]} width={24} height={24} />
              <div>{tokens.length > 1 && tokens[1]}</div>
            </LoanLabel>
            <FigureRow>
              <PriceLabelWrapper>
                <div>
                  {securdFormatFloor(borrowBalances?.borrowBalanceB, 2)}
                </div>
                <div>{securdFormatFloor(loanBUSD, 2)}$</div>
              </PriceLabelWrapper>
              <Image src={RightArrow} alt="arrow" />
              <PriceLabelWrapper>
                <div>{positionData?.debt1.toFixed(2)}</div>
                <div>{positionData?.debtValue1.toFixed(2)}$</div>
              </PriceLabelWrapper>
            </FigureRow>
          </ImpactRow>
        </div>
        <ModalBottomCard>
          <ImpactRow>
            <div>Collateral Factor</div>
            <FigureRow>
              <div>{formattedCF}</div>
              <Image src={RightArrow} alt="arrow" />
              <div>{formatPCTFactor(positionData?.collateralFactor)}</div>
            </FigureRow>
          </ImpactRow>
          <ImpactRow>
            <div>Liquidation threshold</div>
            <FigureRow>
              <div>{formattedLT || "--"}</div>
              <Image src={RightArrow} alt="arrow" />
              <div>{formatPCTFactor(positionData?.liquidationThreshold)}</div>
            </FigureRow>
          </ImpactRow>
          {activeAction === FarmActionMode.LEVERAGE && (
            <ImpactRow>
              <div>Leverage</div>
              <FigureRow>
                <div>
                  {bigIntToDecimal(leverageFactor, 18)?.toFixed(1) || "--"}x
                </div>
                <Image src={RightArrow} alt="arrow" />
                <div>{positionData?.leverageFactor.toFixed(1)}x</div>
              </FigureRow>
            </ImpactRow>
          )}
        </ModalBottomCard>
      </ModalSection>
    </ModalWrapper>
  );
};

export default TransactionConfirmationModal;
