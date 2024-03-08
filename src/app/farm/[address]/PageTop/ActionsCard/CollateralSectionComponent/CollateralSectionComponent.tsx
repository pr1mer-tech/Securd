import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActionButtonContainer,
  ActionContainer,
  ActionSectionContainer,
  AssetSectionContainer,
  HeaderContainer,
  InfoWalletContainer,
  InfoWalletListContainer,
  InputAmount,
  InputAmountContainer,
  UtilisationText,
} from "../LeverageSectionComponent/LeverageSectionComponent.styled";
import Button from "@/components/Button/Button";
import {
  ButtonType,
  FarmActionMode,
  LockOptions,
  PriorityLevel,
} from "@/utils/types/enums";
import UniswapLogo from "../../../../../../assets/logos/Uniswap-logo.svg";
import InfoPairComponent from "@/components/InfoPairComponet/InfoPairComponent";
import {
  bigIntToDecimal,
  getDepositAmountBigInt,
} from "@/utils/helpers/main.helpers";
import { FarmContext } from "@/context/Farm.context";
import { securdFormat } from "@/utils/helpers/numberFormat.helpers";
import TransactionConfirmationModal from "@/components/Modals/TransactionConfirmationModal/TransactionConfirmationModal";
import Modal from "@/components/Modal/Modal";
import { MainContext } from "@/context/Main.context";
import { ButtonsWrapper } from "../ActionsCard.styled";
import NavigationButton from "@/components/NavigationButton/NavigationButton";
import { main } from "@/app/styles/theme.styled";
import { approveFarm } from "@/utils/hooks/ethers/farm/approveFarm";
import useStepsToaster from "@/utils/hooks/useStepsToaster";
import { supplyFarm } from "@/utils/hooks/ethers/farm/supplyFarm";
import { withdrawFarm } from "@/utils/hooks/ethers/farm/withdrawFarm";

const CollateralSectionComponent = () => {
  const {
    activeAction,
    assetsIcons,
    collateralAmount,
    lockAction,
    selectedCollateralInfo,
    setLockAction,
    setShowTransactionModal,
    setTransactionAmount,
    showTransactionModal,
    tokens,
    transactionAmount,
    walletLpTokensBalance,
  } = useContext(FarmContext);
  const { windowWidth } = useContext(MainContext);

  const depositAmount: bigint | undefined = useMemo(() => {
    return getDepositAmountBigInt(transactionAmount, 18);
  }, [transactionAmount]);

  const collateralAmountDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralAmount, 18);
  }, [collateralAmount]);

  useEffect(() => {
    setTransactionAmount(0);
  }, []);

  // State to track the active tab
  const [activeTab, setActiveTab] = useState("APPROVE");

  const [approveState, setApproveState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [lockState, setLockState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [releaseState, setReleaseState] = useState({
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
    "LOCK",
    lockState.isSuccess,
    lockState.isLoading,
    lockState.isError
  );
  useStepsToaster(
    "RELEASE",
    releaseState.isSuccess,
    releaseState.isLoading,
    releaseState.isError
  );

  const onLock = async () => {
    setLockAction(LockOptions.LOCK);

    if (!approveState.isSuccess) {
      await approveFarm(
        depositAmount!,
        selectedCollateralInfo?.addressLP?.toString()!,
        setApproveState
      );
    } else {
      setShowTransactionModal(true);
    }
  };

  const onSupply = async () => {
    await supplyFarm(
      depositAmount!,
      selectedCollateralInfo?.addressLP?.toString()!,
      setLockState,
      setApproveState
    );
  };

  const onWithdraw = async () => {
    await withdrawFarm(
      depositAmount!,
      selectedCollateralInfo?.addressLP?.toString()!,
      setReleaseState
    );
  };

  const onRelease = () => {
    setLockAction(LockOptions.RELEASE);
    setShowTransactionModal(true);
  };

  const displayApprove = useMemo(() => {
    return !approveState.isSuccess && activeAction === FarmActionMode.LOCK;
  }, [activeAction, approveState.isSuccess]);

  return (
    <ActionSectionContainer>
      <HeaderContainer>
        <h1>Collateral</h1>
        <InfoPairComponent
          scale={0.6}
          assetsIconList={assetsIcons}
          tokensList={tokens}
          dexIcon={UniswapLogo}
        />
      </HeaderContainer>

      <ActionButtonContainer style={{ marginTop: "0px" }}>
        <ButtonsWrapper>
          <NavigationButton
            active={activeTab === "APPROVE"}
            label="Lock"
            color={
              activeTab === "APPROVE"
                ? main.colors.securdPrimary
                : main.colors.securdGrey
            }
            outline
            defaultOutlined
            padding="1rem 0"
            width={windowWidth < 1100 ? "100px" : "150px"}
            onClick={() => setActiveTab("APPROVE")}
          />
          <NavigationButton
            active={activeTab === "RELEASE"}
            label="Release"
            color={
              activeTab === "RELEASE"
                ? main.colors.securdPrimary
                : main.colors.securdGrey
            }
            outline
            defaultOutlined
            padding="1rem 0"
            width={windowWidth < 1100 ? "100px" : "150px"}
            onClick={() => setActiveTab("RELEASE")}
          />
        </ButtonsWrapper>
      </ActionButtonContainer>

      {activeTab === "APPROVE" && (
        <>
          <ActionContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <UtilisationText
                style={{
                  flexGrow: 1,
                  marginBottom: "-20px",
                  marginRight: "20px",
                }}
              >
                Enter amount to set your collateral position
              </UtilisationText>

              <InfoWalletListContainer>
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
                    <p>{securdFormat(walletLpTokensBalance, 2)}</p>
                    <InfoPairComponent
                      scale={0.4}
                      assetsIconList={assetsIcons}
                      tokensList={tokens}
                      dexIcon={UniswapLogo}
                    />
                  </div>
                </InfoWalletContainer>
              </InfoWalletListContainer>
            </div>

            <InputAmountContainer>
              <InputAmount
                value={transactionAmount || ""}
                onChange={(e) => {
                  e.preventDefault();
                  setTransactionAmount(Number(e.target.value));
                }}
                type="number"
                placeholder="Amount"
              />
              <AssetSectionContainer>
                <InfoPairComponent
                  scale={0.7}
                  assetsIconList={assetsIcons}
                  tokensList={tokens}
                  dexIcon={UniswapLogo}
                />
              </AssetSectionContainer>
            </InputAmountContainer>
          </ActionContainer>
          <ActionButtonContainer>
            <Button
              onClick={onLock}
              priority={PriorityLevel.SECONDARY}
              label={displayApprove ? "Approve Lock" : "Lock"}
              padding="0.7rem 1.5rem"
              width="100%"
              type={ButtonType.SUBMIT}
              disabled={
                transactionAmount <= 0 ||
                transactionAmount > walletLpTokensBalance! ||
                approveState.isLoading ||
                lockState.isLoading ||
                releaseState.isLoading
              }
            />
          </ActionButtonContainer>
        </>
      )}

      {activeTab === "RELEASE" && (
        <>
          <ActionContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <UtilisationText
                style={{
                  flexGrow: 1,
                  marginBottom: "-20px",
                  marginRight: "20px",
                }}
              >
                Enter amount to set your collateral position
              </UtilisationText>

              <InfoWalletListContainer>
                <InfoWalletContainer>
                  <h2>Collateral Balance</h2>
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <p>{securdFormat(collateralAmountDecimal, 2)}</p>
                    <InfoPairComponent
                      scale={0.4}
                      assetsIconList={assetsIcons}
                      tokensList={tokens}
                      dexIcon={UniswapLogo}
                    />
                  </div>
                </InfoWalletContainer>
              </InfoWalletListContainer>
            </div>

            <InputAmountContainer>
              <InputAmount
                value={transactionAmount || ""}
                onChange={(e) => {
                  e.preventDefault();
                  setTransactionAmount(Number(e.target.value));
                }}
                type="number"
                placeholder="Amount"
              />
              <AssetSectionContainer>
                <InfoPairComponent
                  scale={0.7}
                  assetsIconList={assetsIcons}
                  tokensList={tokens}
                  dexIcon={UniswapLogo}
                />
              </AssetSectionContainer>
            </InputAmountContainer>
          </ActionContainer>
          <ActionButtonContainer>
            <Button
              onClick={onRelease}
              priority={PriorityLevel.SECONDARY}
              label="Release"
              padding="0.7rem 1.5rem"
              width="100%"
              type={ButtonType.SUBMIT}
              disabled={
                collateralAmount === BigInt(0) ||
                transactionAmount <= 0 ||
                transactionAmount > collateralAmount! / BigInt(10 ** 18) ||
                approveState.isLoading ||
                lockState.isLoading ||
                releaseState.isLoading
              }
            />
          </ActionButtonContainer>
        </>
      )}

      <Modal
        onConfirm={async () => {
          if (lockAction === LockOptions.LOCK) {
            await onSupply();
          } else {
            await onWithdraw();
          }
          setTransactionAmount(0);
        }}
        showModal={showTransactionModal}
        setShowModal={setShowTransactionModal}
        title={`Confirm ${
          lockAction === LockOptions.LOCK ? "Lock" : "Release"
        }`}
        width={windowWidth < 600 ? "100%" : "700px"}
      >
        <TransactionConfirmationModal />
      </Modal>
    </ActionSectionContainer>
  );
};

export default CollateralSectionComponent;
