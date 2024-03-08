import React, { useContext, useMemo } from "react";
import {
  DetailItem,
  FigureRow,
  ImpactRow,
  ModalSection,
  ModalWrapper,
  PriceLabelWrapper,
  SectionTitle,
} from "./SaveConfirmationModal.styles";
import Image from "next/image";
import RightArrow from "@/assets/icons/right-arrow.svg";
import { SaveContext } from "@/context/Save.context";
import useUserDepositBalance from "@/utils/hooks/useUserDepositBalance";
import { MainContext } from "@/context/Main.context";
import { Coins } from "@/utils/types/save.types";
import { ActionMode } from "@/utils/types/enums";

const SaveConfirmationModal = () => {
  const { coinPrices } = useContext(MainContext);
  const { actionMode, selectedReserveInfo, transactionAmount } =
    useContext(SaveContext);

  const { userDepositBalance } = useUserDepositBalance(selectedReserveInfo);

  const price = useMemo(() => {
    return coinPrices[selectedReserveInfo?.symbol as keyof Coins];
  }, [selectedReserveInfo, coinPrices]);

  const newBalance = useMemo(() => {
    if (actionMode === ActionMode.DEPOSIT) {
      return userDepositBalance + transactionAmount;
    } else {
      return userDepositBalance - transactionAmount;
    }
  }, [userDepositBalance, transactionAmount]);

  const transactionValue = useMemo(() => {
    return transactionAmount * price;
  }, [transactionAmount, price]);

  const balanceValue = useMemo(() => {
    return userDepositBalance * price;
  }, [userDepositBalance, price]);

  const impactValue = useMemo(() => {
    if (actionMode === ActionMode.DEPOSIT) {
      return balanceValue + transactionValue;
    } else {
      return balanceValue - transactionValue;
    }
  }, [balanceValue, transactionValue]);

  return (
    <ModalWrapper>
      <ModalSection bordered>
        <SectionTitle>Transaction Details</SectionTitle>
        <DetailItem>
          <div>{actionMode}</div>
          <PriceLabelWrapper>
            <div>
              {transactionAmount.toFixed(2)} {selectedReserveInfo?.symbol}
            </div>
            <div>{transactionValue.toFixed(2)}$</div>
          </PriceLabelWrapper>
        </DetailItem>
      </ModalSection>
      <ModalSection>
        <SectionTitle>Impact on my account</SectionTitle>
        <div>
          <ImpactRow bordered>
            <div>Balance</div>
            <FigureRow>
              <PriceLabelWrapper>
                <div>{userDepositBalance.toFixed(2)}</div>
                <div>{balanceValue.toFixed(2)}$</div>
              </PriceLabelWrapper>
              <Image src={RightArrow} alt="arrow" />
              <PriceLabelWrapper>
                <div>{newBalance.toFixed(2)}</div>
                <div>{impactValue.toFixed(2)}$</div>
              </PriceLabelWrapper>
            </FigureRow>
          </ImpactRow>
        </div>
      </ModalSection>
    </ModalWrapper>
  );
};

export default SaveConfirmationModal;
