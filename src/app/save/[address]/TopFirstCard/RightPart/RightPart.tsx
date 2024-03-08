"use client";
import React, { ChangeEvent, useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { main } from "@/app/styles/theme.styled";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import { SaveContext } from "@/context/Save.context";
import AmountInput from "@/components/AmountInput/AmountInput";
import Button from "@/components/Button/Button";
import NavigationButton from "@/components/NavigationButton/NavigationButton";
import Slider, { SliderValue } from "@/components/Slider/Slider";
import Title from "@/components/Title/Title";
import { MainContext } from "@/context/Main.context";
import { getMinDepositAmount } from "@/utils/helpers/lenderPool.helpers";
import {
  APYWrapper,
  ButtonsWrapper,
  RightPartContainer,
  RowInputWrapper,
  SliderWrapper,
  TopRow,
  WalletBalanceLabel,
  CardTitleWrapper,
} from "./RightPart.styled";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  securdFormatFloor,
  toFormattedPercentage,
} from "@/utils/helpers/numberFormat.helpers";
import { ActionMode, ButtonType, PriorityLevel } from "@/utils/types/enums";
import {
  bigIntToDecimal,
  getDepositAmountBigInt,
} from "@/utils/helpers/main.helpers";
import { BalanceCoins } from "@/utils/types/save.types";
import { AddressZero } from "@/utils/constants/constants";
import useUserDepositBalance from "@/utils/hooks/useUserDepositBalance";
import Modal from "@/components/Modal/Modal";
import SaveConfirmationModal from "@/components/Modals/SaveConfirmationModal/SaveConfirmationModal";
import { approveSave } from "@/utils/hooks/ethers/save/approveSave";
import { supplySave } from "@/utils/hooks/ethers/save/supplySave";
import { withdrawSave } from "@/utils/hooks/ethers/save/withdrawSave";
import useStepsToaster from "@/utils/hooks/useStepsToaster";

const RightPart = () => {
  const [validApprove, setValidApprove] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const { balanceCoins } = useContext(MainContext);
  const {
    actionMode,
    balancePct,
    params,
    pool,
    setActionMode,
    setBalancePct,
    setShowTransactionModal,
    setTransactionAmount,
    selectedReserveInfo,
    showSaveTransactionModal,
    transactionAmount,
    userBalanceData,
  } = useContext(SaveContext);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { windowWidth } = useContext(MainContext);

  const poolAPY = useMemo(() => {
    return 0;
  }, [pool]);

  const minDepositAmount = useMemo(
    () => pool && getMinDepositAmount(pool),
    [pool]
  );

  const userTotalBalance = useMemo(() => {
    return 0;
  }, [pool, userBalanceData]);

  const depositAmount: bigint | undefined = useMemo(() => {
    return getDepositAmountBigInt(
      transactionAmount,
      actionMode === ActionMode.DEPOSIT ? selectedReserveInfo?.decimals : 18
    );
  }, [transactionAmount, selectedReserveInfo]);

  const isEther: boolean = useMemo(() => {
    return params?.address === AddressZero;
  }, [params]);

  const { userDepositBalance: accountBalance } =
    useUserDepositBalance(selectedReserveInfo);

  const userBalance = useMemo(() => {
    return bigIntToDecimal(
      balanceCoins[selectedReserveInfo?.symbol as keyof BalanceCoins],
      selectedReserveInfo?.decimals
    );
  }, [balanceCoins, selectedReserveInfo]);

  const defaultValue = useMemo(() => {
    if (actionMode === ActionMode.DEPOSIT) {
      return balancePct !== 0 && userBalance
        ? Math.fround((balancePct / 100) * userBalance)
        : undefined;
    } else {
      return balancePct !== 0 && userTotalBalance
        ? Math.fround((balancePct / 100) * userTotalBalance)
        : undefined;
    }
  }, [balancePct, userBalance, userTotalBalance, actionMode]);

  const label = useMemo(() => {
    return actionMode === ActionMode.WITHDRAW ? "Withdraw" : "Deposit";
  }, [actionMode, isEther, validApprove]);

  const sliderAction = (slidevalue: SliderValue) => {
    setBalancePct(slidevalue.value);
    if (actionMode === ActionMode.DEPOSIT && userBalance) {
      if (slidevalue.index === 4) {
        setTransactionAmount((slidevalue.value / 100) * userBalance || 0);
      } else {
        setTransactionAmount((slidevalue.value / 100) * userBalance || 0);
      }
    } else {
      if (actionMode === ActionMode.WITHDRAW && accountBalance) {
        if (slidevalue.index === 4) {
          setTransactionAmount((slidevalue.value / 100) * accountBalance || 0);
        } else {
          // setTransactionAmount(getRounded((slidevalue.value / 100) * accountBalance, 2) || 0);
          setTransactionAmount((slidevalue.value / 100) * accountBalance || 0);
        }
      }
    }
  };

  const [approveState, setApproveState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [depositState, setDepositState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  const [withdrawState, setWithdrawState] = useState({
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
    "DEPOSIT",
    depositState.isSuccess,
    depositState.isLoading,
    depositState.isError
  );
  useStepsToaster(
    "WITHDRAW",
    withdrawState.isSuccess,
    withdrawState.isLoading,
    withdrawState.isError
  );

  const onApprove = async () => {
    setActionMode(ActionMode.DEPOSIT);

    if (!approveState.isSuccess) {
      await approveSave(
        depositAmount!,
        selectedReserveInfo?.address.toString()!,
        setApproveState
      );
    } else {
      setShowTransactionModal(true);
    }
  };

  const onDeposit = async () => {
    await supplySave(
      depositAmount!,
      selectedReserveInfo?.address.toString()!,
      setDepositState,
      setApproveState
    );
  };

  const onWithdraw = async () => {
    await withdrawSave(
      depositAmount!,
      selectedReserveInfo?.address.toString()!,
      setWithdrawState
    );
  };

  const submit = () => {
    if (actionMode === ActionMode.DEPOSIT && !isEther && !validApprove) {
      onApprove();
    } else {
      setShowTransactionModal(true);
    }
  };

  return (
    <RightPartContainer>
      <CardTitleWrapper borderColor={main.colors.securdLightGrey}>
        <Title
          priority={2}
          label={`Deposit / Withdraw ${pool?.asset.fa12?.symbol || ""}`}
          color={main.colors.securdPrimary}
        />
        <APYWrapper>
          <Title priority={2} label={toFormattedPercentage(poolAPY, 1)} />
          <Title
            priority={4}
            label={
              <Tooltip title="Saving APY">
                Current yield for this account
              </Tooltip>
            }
          />
        </APYWrapper>
      </CardTitleWrapper>
      <TopRow>
        <ButtonsWrapper>
          <NavigationButton
            active={actionMode === ActionMode.DEPOSIT}
            label="Deposit"
            color={
              actionMode === ActionMode.DEPOSIT
                ? main.colors.securdPrimary
                : main.colors.securdGrey
            }
            outline
            defaultOutlined
            padding="1rem 0"
            width={windowWidth < 1100 ? "100px" : "150px"}
            onClick={() => setActionMode(ActionMode.DEPOSIT)}
          />
          <NavigationButton
            active={actionMode === ActionMode.WITHDRAW}
            label="Withdraw"
            color={
              actionMode === ActionMode.WITHDRAW
                ? main.colors.securdPrimary
                : main.colors.securdGrey
            }
            outline
            defaultOutlined
            padding="1rem 0"
            width={windowWidth < 1100 ? "100px" : "150px"}
            onClick={() => setActionMode(ActionMode.WITHDRAW)}
          />
        </ButtonsWrapper>
        <WalletBalanceLabel>
          {actionMode === ActionMode.DEPOSIT ? (
            <Tooltip title="Wallet Balance">
              Amount of this asset in your wallet
            </Tooltip>
          ) : (
            <Tooltip title="Account Balance">
              Amount of this asset in your Savings Account
            </Tooltip>
          )}
          {`${actionMode === ActionMode.DEPOSIT
            ? securdFormatFloor(userBalance, 2)
            : securdFormatFloor(accountBalance, 2)
            } ${selectedReserveInfo?.symbol}`}
        </WalletBalanceLabel>
      </TopRow>
      <RowInputWrapper onSubmit={handleSubmit(submit)}>
        <AmountInput
          cryptos={[selectedReserveInfo?.imgSrc || ""]}
          tokenSymbols={[selectedReserveInfo?.symbol || ""]}
          defaultValue={defaultValue}
          min={minDepositAmount}
          max={
            actionMode === ActionMode.DEPOSIT ? userBalance : userTotalBalance
          }
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const value = Number(event.target.value);
            setTransactionAmount(value);
            if (actionMode === ActionMode.DEPOSIT) {
              userBalance && setBalancePct((value / userBalance) * 100);
            } else {
              userTotalBalance &&
                setBalancePct((value / userTotalBalance) * 100);
            }
          }}
          required
          register={register}
          setValue={setValue}
          value={transactionAmount}
          actionMode={actionMode}
        />
        {actionMode !== ActionMode.WITHDRAW && !isEther && !validApprove ? (
          <Button
            disabled={
              transactionAmount <= 0 ||
              userBalance! < transactionAmount ||
              approveState.isLoading ||
              depositState.isLoading ||
              withdrawState.isLoading
            }
            label={approveState.isSuccess ? "Deposit" : "Approve"}
            onClick={submit}
            padding="0.7rem 1.5rem"
            priority={PriorityLevel.SECONDARY}
            type={ButtonType.SUBMIT}
            width={windowWidth > 800 ? "151px" : "100%"}
          />
        ) : (
          <Button
            disabled={
              transactionAmount <= 0 ||
              accountBalance! < transactionAmount ||
              approveState.isLoading ||
              depositState.isLoading ||
              withdrawState.isLoading
            }
            label={label}
            onClick={submit}
            padding="0.7rem 1.5rem"
            priority={PriorityLevel.SECONDARY}
            type={ButtonType.SUBMIT}
            width={windowWidth > 800 ? "151px" : "100%"}
          />
        )}
      </RowInputWrapper>
      <ErrorMessage
        show={errors.amount ? true : false}
        message={(errors.amount?.message as string) || ""}
      />
      <SliderWrapper>
        <Slider
          width={windowWidth > 800 ? "60%" : "90%"}
          onChange={sliderAction}
          value={sliderValue}
          onActualChange={(value: number) => setSliderValue(value)}
        />
      </SliderWrapper>
      <Modal
        onConfirm={async () => {
          if (actionMode === ActionMode.WITHDRAW) {
            await onWithdraw();
            setValidApprove(false);
          } else {
            await onDeposit();
          }
          setTransactionAmount(0);
          sliderAction({ value: 0, index: 0 });
          setSliderValue(0);
        }}
        setShowModal={setShowTransactionModal}
        showModal={showSaveTransactionModal}
        title={`Confirm ${actionMode}`}
        width={windowWidth < 600 ? "100%" : "700px"}
      >
        <SaveConfirmationModal />
      </Modal>
    </RightPartContainer>
  );
};

export default RightPart;
