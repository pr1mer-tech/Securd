import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActionButtonContainer,
  ActionContainer,
  ActionSectionContainer,
  AssetSectionContainer,
  HeaderContainer,
  InfoWalletContainer,
  InputAmount,
  InputAmountContainer,
  UtilisationText,
} from "../LeverageSectionComponent/LeverageSectionComponent.styled";
import Button from "@/components/Button/Button";
import { BorrowOptions, ButtonType, PriorityLevel } from "@/utils/types/enums";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import PairSelector from "@/components/PairSelector/PairSelector";
import { FarmContext } from "@/context/Farm.context";
import { securdFormatFloor } from "@/utils/helpers/numberFormat.helpers";
import {
  bigIntToDecimal,
  getDepositAmountBigInt,
} from "@/utils/helpers/main.helpers";
import Modal from "@/components/Modal/Modal";
import { MainContext } from "@/context/Main.context";
import TransactionConfirmationModal from "@/components/Modals/TransactionConfirmationModal/TransactionConfirmationModal";
import { useAccount, useBalance } from "wagmi";
import { ButtonsWrapper } from "../ActionsCard.styled";
import NavigationButton from "@/components/NavigationButton/NavigationButton";
import { main } from "@/app/styles/theme.styled";
import useStepsToaster from "@/utils/hooks/useStepsToaster";
import { borrow } from "@/utils/hooks/ethers/farm/borrow";
import { approveFarm } from "@/utils/hooks/ethers/farm/approveFarm";
import { repay } from "@/utils/hooks/ethers/farm/repay";

const LoanSectionComponent = () => {
  const {
    assetsIcons,
    borrowAction,
    borrowBalances,
    pairReservesInfos,
    selectedCollateralInfo,
    setBorrowAction,
    setShowTransactionModal,
    setTransactionAmount,
    setTokenSelected,
    showTransactionModal,
    tokens,
    transactionAmount,
    collateralAmount,
  } = useContext(FarmContext);
  const { windowWidth } = useContext(MainContext);

  const [activeTab, setActiveTab] = useState("Borrow");

  const [selectedPair, setSelectedPair] = useState({
    token: tokens[0],
    index: 0,
  });

  const depositAmount: bigint | undefined = useMemo(() => {
    return getDepositAmountBigInt(transactionAmount, 18);
  }, [transactionAmount]);

  const collateralAmountThresholdDecimal: number | undefined = useMemo(() => {
    const decimalValue = bigIntToDecimal(collateralAmount, 18);
    return decimalValue! * 0.8;
  }, [collateralAmount]);

  useEffect(() => {
    setTransactionAmount(0);
  }, []);

  const { address } = useAccount();
  const { data: userBalance } = useBalance({
    address: address,
    token:
      selectedPair.index === 0
        ? pairReservesInfos.reserveInfoTokenA?.address
        : pairReservesInfos.reserveInfoTokenB?.address,
    watch: true,
  });

  const [approveState, setApproveState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [borrowState, setBorrowState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [repayState, setRepayState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  useStepsToaster(
    "APPROVE",
    approveState.isSuccess,
    approveState.isLoading,
    approveState.isError
  );
  useStepsToaster(
    "BORROW",
    borrowState.isSuccess,
    borrowState.isLoading,
    borrowState.isError
  );
  useStepsToaster(
    "REPAY",
    repayState.isSuccess,
    repayState.isLoading,
    repayState.isError
  );

  /*   const {
    approveSuccess: approveSuccessRepay,
    writeApprove: writeApproveRepay,
  } = useApproveFarm(
    depositAmount,
    selectedPair.index === 0
      ? pairReservesInfos.reserveInfoTokenA?.address
      : pairReservesInfos.reserveInfoTokenB?.address,
    true
  );

  const { write: borrow } = useBorrow(
    selectedCollateralInfo,
    selectedPair.index === 0
      ? pairReservesInfos.reserveInfoTokenA?.address
      : pairReservesInfos.reserveInfoTokenB?.address,
    depositAmount,
    true
  );

  const { write: repay } = useRepay(
    selectedCollateralInfo,
    selectedPair.index === 0
      ? pairReservesInfos.reserveInfoTokenA?.address
      : pairReservesInfos.reserveInfoTokenB?.address,
    depositAmount,
    true
  ); */

  const onBorrow = async () => {
    await borrow(
      selectedCollateralInfo?.addressLP!,
      selectedPair.index === 0
        ? pairReservesInfos.reserveInfoTokenA?.address.toString()!
        : pairReservesInfos.reserveInfoTokenB?.address.toString()!,
      depositAmount!,
      setBorrowState
    );
  };

  const onRepay = async () => {
    await repay(
      selectedCollateralInfo?.addressLP!,
      selectedPair.index === 0
        ? pairReservesInfos.reserveInfoTokenA?.address.toString()!
        : pairReservesInfos.reserveInfoTokenB?.address.toString()!,
      depositAmount!,
      setRepayState,
      setApproveState
    );
  };

  const onApprove = async () => {
    setBorrowAction(BorrowOptions.REPAY);

    if (!approveState.isSuccess) {
      await approveFarm(
        depositAmount!,
        selectedPair.index === 0
          ? pairReservesInfos.reserveInfoTokenA?.address.toString()!
          : pairReservesInfos.reserveInfoTokenB?.address.toString()!,
        setApproveState
      );
    } else {
      setShowTransactionModal(true);
    }
  };

  let displayApprove = useMemo(() => {
    if (!approveState.isSuccess) {
      return true;
    } else return false;
  }, [approveState.isSuccess]);

  const [repayThreshold, setRepayThreshold] = useState(0);
  useEffect(() => {
    const threshold = selectedPair.index
      ? borrowBalances?.borrowBalanceB
      : borrowBalances?.borrowBalanceA;

    setRepayThreshold(threshold!);
  }, [selectedPair, borrowBalances]);

  return (
    <ActionSectionContainer>
      <HeaderContainer>
        <h1>Loan</h1>
        <PairSelector
          onSelectedPair={(pair) => {
            setSelectedPair(pair);
            setTokenSelected(pair.index);
          }}
          pairArray={tokens}
        />
      </HeaderContainer>

      <ActionButtonContainer style={{ marginTop: "0px" }}>
        <ButtonsWrapper>
          <NavigationButton
            active={activeTab === "Borrow"}
            label="Borrow"
            color={
              activeTab === "Borrow"
                ? main.colors.securdPrimary
                : main.colors.securdGrey
            }
            outline
            defaultOutlined
            padding="1rem 0"
            width={windowWidth < 1100 ? "100px" : "150px"}
            onClick={() => setActiveTab("Borrow")}
          />
          <NavigationButton
            active={activeTab === "Repay"}
            label="Repay"
            color={
              activeTab === "Repay"
                ? main.colors.securdPrimary
                : main.colors.securdGrey
            }
            outline
            defaultOutlined
            padding="1rem 0"
            width={windowWidth < 1100 ? "100px" : "150px"}
            onClick={() => setActiveTab("Repay")}
          />
        </ButtonsWrapper>
      </ActionButtonContainer>

      {activeTab === "Borrow" && (
        <>
          <ActionContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <UtilisationText
                style={{
                  flexGrow: 1,
                  marginBottom: "0px",
                  marginRight: "20px",
                }}
              >
                Enter amount to set Loan position
              </UtilisationText>

              <InfoWalletContainer>
                <h2>Wallet Balance</h2>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <p>{Number(userBalance?.formatted || 0).toFixed(2)}</p>
                  <CryptoLogo
                    crypto={assetsIcons[selectedPair.index]}
                    width={24}
                    height={24}
                  />
                  <p>{tokens[selectedPair.index]}</p>
                </div>
              </InfoWalletContainer>
            </div>
            <InputAmountContainer>
              <InputAmount
                placeholder="Amount"
                type="number"
                min={0}
                onChange={(e) => {
                  e.preventDefault();
                  setTransactionAmount(Number(e.target.value));
                }}
                value={transactionAmount ? transactionAmount : ""}
              />
              <AssetSectionContainer style={{ marginRight: "24px" }}>
                <CryptoLogo
                  crypto={assetsIcons[selectedPair.index]}
                  width={24}
                  height={24}
                />
                <p>{tokens[selectedPair.index]}</p>
              </AssetSectionContainer>
            </InputAmountContainer>
          </ActionContainer>
          <ActionButtonContainer>
            <Button
              onClick={onBorrow}
              priority={PriorityLevel.SECONDARY}
              label={"Borrow"}
              padding="0.7rem 1.5rem"
              width="100%"
              type={ButtonType.SUBMIT}
              disabled={
                transactionAmount <= 0 ||
                Number(userBalance?.formatted) < transactionAmount ||
                collateralAmountThresholdDecimal! < transactionAmount ||
                approveState.isLoading ||
                borrowState.isLoading ||
                repayState.isLoading
              }
            />
          </ActionButtonContainer>
        </>
      )}
      {activeTab === "Repay" && (
        <>
          <ActionContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <UtilisationText
                style={{
                  flexGrow: 1,
                  marginBottom: "0px",
                  marginRight: "20px",
                }}
              >
                Enter amount to set Loan position
              </UtilisationText>
              <InfoWalletContainer>
                <h2>Loan Balance</h2>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <p>
                    {securdFormatFloor(
                      selectedPair.index
                        ? borrowBalances?.borrowBalanceB
                        : borrowBalances?.borrowBalanceA,
                      2
                    )}
                  </p>
                  <CryptoLogo
                    crypto={assetsIcons[selectedPair.index]}
                    width={24}
                    height={24}
                  />
                  <p>{tokens[selectedPair.index]}</p>
                </div>
              </InfoWalletContainer>
            </div>
            <InputAmountContainer>
              <InputAmount
                placeholder="Amount"
                type="number"
                min={0}
                onChange={(e) => {
                  e.preventDefault();
                  setTransactionAmount(Number(e.target.value));
                }}
                value={transactionAmount ? transactionAmount : ""}
              />
              <AssetSectionContainer style={{ marginRight: "24px" }}>
                <CryptoLogo
                  crypto={assetsIcons[selectedPair.index]}
                  width={24}
                  height={24}
                />
                <p>{tokens[selectedPair.index]}</p>
              </AssetSectionContainer>
            </InputAmountContainer>
          </ActionContainer>
          <ActionButtonContainer>
            <Button
              onClick={onApprove}
              priority={PriorityLevel.SECONDARY}
              label={displayApprove ? "Approve Repay" : "Repay"}
              padding="0.7rem 1.5rem"
              width="100%"
              type={ButtonType.SUBMIT}
              disabled={
                transactionAmount <= 0 ||
                repayThreshold < transactionAmount ||
                approveState.isLoading ||
                borrowState.isLoading ||
                repayState.isLoading
              }
            />
          </ActionButtonContainer>
        </>
      )}

      <Modal
        onConfirm={async () => {
          if (borrowAction === BorrowOptions.BORROW) {
            await onBorrow();
          } else {
            await onRepay();
          }
          setTransactionAmount(0);
        }}
        showModal={showTransactionModal}
        setShowModal={setShowTransactionModal}
        title={`Confirm ${
          borrowAction === BorrowOptions.BORROW ? "Borrow" : "Repay"
        }`}
        width={windowWidth < 600 ? "100%" : "700px"}
      >
        <TransactionConfirmationModal />
      </Modal>
    </ActionSectionContainer>
  );
};

export default LoanSectionComponent;
