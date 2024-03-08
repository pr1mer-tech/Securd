import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActionContainer,
  ActionSectionContainer,
  InfoWalletContainer,
  InfoWalletListContainer,
  InputAmountContainer,
  InputAmountLeverage,
  LeverageSliderContainer,
  UtilisationText,
} from "./LeverageSectionComponent.styled";
import { ButtonType, PriorityLevel } from "@/utils/types/enums";
import Button from "@/components/Button/Button";
import SliderV2 from "@/components/SliderV2/SliderV2";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import {
  bigIntToDecimal,
  getDepositAmountBigInt,
} from "@/utils/helpers/main.helpers";
import { FarmContext } from "@/context/Farm.context";
import {
  getBorrowerMaxLeverage,
  getBorrowerPoolBalanceLT,
  getBorrowerPoolMaxLeverage,
  getMaxLT,
} from "@/utils/helpers/borrow.helpers";
import { leverageToLp } from "@/utils/helpers/borrower.helpers";
import Modal from "@/components/Modal/Modal";
import TransactionConfirmationModal from "@/components/Modals/TransactionConfirmationModal/TransactionConfirmationModal";
import { MainContext } from "@/context/Main.context";
import { leverage } from "@/utils/hooks/ethers/farm/leverage";
import { deleverage } from "@/utils/hooks/ethers/farm/deleverage";
import useStepsToaster from "@/utils/hooks/useStepsToaster";

const LeverageSectionComponent = () => {
  const {
    borrowBalances,
    collateralAmount,
    collateralPrice,
    collateralValue,
    isLeverage,
    selectedCollateralInfo,
    setIsLeverage,
    setShowTransactionModal,
    setTransactionAmount,
    showTransactionModal,
    tokensUSDPrices,
    transactionAmount,
  } = useContext(FarmContext);
  const { windowWidth } = useContext(MainContext);

  const userLockedBalance: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralAmount, 18);
  }, [collateralAmount]);

  const depositAmount: bigint | undefined = useMemo(() => {
    return getDepositAmountBigInt(transactionAmount, 18);
  }, [transactionAmount]);

  useEffect(() => {
    setTransactionAmount(0);
  }, []);

  const [leverageState, setLeverageState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [deleverageState, setDeleverageState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const onLeverage = async () => {
    await leverage(
      selectedCollateralInfo?.addressLP.toString()!,
      depositAmount!,
      setLeverageState
    );
  };

  const onDeleverage = async () => {
    await deleverage(
      selectedCollateralInfo?.addressLP.toString()!,
      depositAmount!,
      setDeleverageState
    );
  };

  useStepsToaster(
    "LEVERAGE",
    leverageState.isSuccess,
    leverageState.isLoading,
    leverageState.isError
  );
  useStepsToaster(
    "DELEVERAGE",
    deleverageState.isSuccess,
    deleverageState.isLoading,
    deleverageState.isError
  );

  const { leverageFactor: borrowerLeverageFactorBigint } =
    useCollateralAmountPrice(selectedCollateralInfo?.addressLP);

  const borrowerLeverageFactor = useMemo(() => {
    return bigIntToDecimal(borrowerLeverageFactorBigint, 18);
  }, [borrowerLeverageFactorBigint]);

  const maxLeverageFactor = useMemo(() => {
    return getBorrowerPoolMaxLeverage(selectedCollateralInfo);
  }, [selectedCollateralInfo]);

  const collateralValueDecimal = useMemo(() => {
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

  const minLT = getBorrowerPoolBalanceLT(selectedCollateralInfo);
  const maxLT = getMaxLT(selectedCollateralInfo);

  const borrowerMaxLeverageLP = useMemo(() => {
    return getBorrowerMaxLeverage(
      collateralValueDecimal,
      collateralPrice,
      loanAUSD || 0,
      loanBUSD || 0,
      minLT,
      maxLT
    );
  }, [
    collateralValueDecimal,
    collateralPrice,
    loanAUSD,
    loanBUSD,
    minLT,
    maxLT,
  ]);

  const [leverageFactor, setLeverageFactor] = useState<number>(
    borrowerLeverageFactor!
  );

  const sliderActionOnChange = (value: number) => {
    setLeverageFactor(value);

    if (value / 10 > Number(borrowerLeverageFactor)) {
      const factor =
        value / 10 - borrowerLeverageFactor! < 0.1
          ? borrowerLeverageFactor
          : value / 10;

      setTransactionAmount(
        leverageToLp(
          factor!,
          borrowerLeverageFactor,
          maxLeverageFactor,
          borrowerMaxLeverageLP
        ) || 0
      );
    } else {
      const userLockedBalanceNum = userLockedBalance!;
      const transactionAmount =
        userLockedBalanceNum -
        (userLockedBalanceNum * value) / 10 / borrowerLeverageFactor!;

      setTransactionAmount(transactionAmount);
    }
  };

  useEffect(() => {
    const status = leverageFactor / 10 > Number(borrowerLeverageFactor);
    setIsLeverage(status);
  }, [borrowerLeverageFactor, leverageFactor]);

  return (
    <ActionSectionContainer>
      <h1>Leverage</h1>
      <InfoWalletListContainer>
        <InfoWalletContainer>
          <h2>Current Leverage</h2>
          <p>{Number(borrowerLeverageFactor?.toFixed(1))}x</p>
        </InfoWalletContainer>
        <InfoWalletContainer>
          <h2>Max Leverage</h2>
          <p>{Number(maxLeverageFactor?.toFixed(1))}x</p>
        </InfoWalletContainer>
      </InfoWalletListContainer>
      <ActionContainer>
        <UtilisationText>
          Enter amount to set your Leverage position or drag the slider
        </UtilisationText>
        <LeverageSliderContainer>
          {borrowerLeverageFactor && maxLeverageFactor && (
            <SliderV2
              value={leverageFactor}
              width="80%"
              onChange={sliderActionOnChange}
              min={0}
              max={Number(maxLeverageFactor?.toFixed(1)) * 10}
              percentage={false}
            />
          )}
          <InputAmountContainer paddingleft="0px" width={20}>
            <InputAmountLeverage
              onChange={(e) => {
                e.preventDefault();
                setLeverageFactor(Number(e.target.value) * 10);
              }}
              value={leverageFactor > 0 ? leverageFactor / 10 : ""}
              textpos="center"
              placeholder="1"
              type="number"
            />
            <h1 style={{ marginRight: "14px" }}>x</h1>
          </InputAmountContainer>
        </LeverageSliderContainer>
      </ActionContainer>
      <Button
        priority={PriorityLevel.SECONDARY}
        onClick={() => setShowTransactionModal(true)}
        label={isLeverage ? "Select a leverage" : "Select a deleverage"}
        padding="0.7rem 1.5rem"
        width="100%"
        type={ButtonType.SUBMIT}
        disabled={leverageState.isLoading || leverageState.isLoading}
      />
      <Modal
        onConfirm={async () => {
          if (isLeverage) {
            await onLeverage();
          } else {
            await onDeleverage();
          }
          setLeverageFactor(leverageFactor);
        }}
        showModal={showTransactionModal}
        setShowModal={setShowTransactionModal}
        title={`Confirm ${isLeverage ? "Leverage" : "Deleverage"}`}
        width={windowWidth < 600 ? "100%" : "700px"}
      >
        <TransactionConfirmationModal />
      </Modal>
    </ActionSectionContainer>
  );
};

export default LeverageSectionComponent;
