"use client";
import React, { useContext, useMemo } from "react";
import { Collapse } from "react-collapse";
import { MainContext } from "@/context/Main.context";
import { FarmContext } from "@/context/Farm.context";
import Title from "@/components/Title/Title";
import Card from "@/components/Card/Card";
import { CardHeader } from "../PageTop.styled";
import LockIconWhite from "@/assets/icons/lock-icon-white.svg";
import LockIconPrimary from "@/assets/icons/lock-icon-primary.svg";
import LeverageIconWhite from "@/assets/icons/leverage-icon-white.svg";
import LeverageIconPrimary from "@/assets/icons/leverage-icon-primary.svg";
import BorrowIconWhite from "@/assets/icons/borrow-icon-white.svg";
import BorrowIconPrimary from "@/assets/icons/borrow-icon-primary.svg";
import ChevronDownPrimary from "@/assets/icons/chevron-down-primary.svg";
import { ActionButton, ButtonsWrapper } from "./ActionsCard.styled";
import ActionPannel from "./ActionPannel/ActionPannel";
import { main } from "@/app/styles/theme.styled";
import { FarmActionMode } from "@/utils/types/enums";
import Image from "next/image";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";

const ActionsCard = () => {
  const { activeAction, setActiveAction, selectedCollateralInfo } =
    useContext(FarmContext);
  const { windowWidth } = useContext(MainContext);
  const { collateralAmount } = useCollateralAmountPrice(
    selectedCollateralInfo?.addressLP
  );

  const leverageIcon = useMemo(
    () =>
      activeAction === FarmActionMode.LEVERAGE
        ? LeverageIconWhite
        : LeverageIconPrimary,
    [activeAction]
  );

  const borrowIcon = useMemo(
    () =>
      activeAction === FarmActionMode.BORROW
        ? BorrowIconWhite
        : BorrowIconPrimary,
    [activeAction]
  );

  return (
    <Card>
      <CardHeader>
        <Title
          priority={windowWidth < 800 ? 3 : 2}
          label="Actions"
          color={main.colors.securdPrimary}
        />
      </CardHeader>
      <ButtonsWrapper>
        <ActionButton
          active={activeAction === FarmActionMode.LOCK}
          onClick={() => {
            setActiveAction(FarmActionMode.LOCK);
          }}
        >
          <Image
            src={
              activeAction === FarmActionMode.LOCK
                ? LockIconWhite
                : LockIconPrimary
            }
            alt="LockIcon"
          />
          <span>Collateral</span>
          <div className="hover-icon">
            <Image src={ChevronDownPrimary} alt="ChevronDown" />
          </div>
        </ActionButton>
        <ActionButton
          active={activeAction === FarmActionMode.LEVERAGE}
          onClick={() => {
            setActiveAction(FarmActionMode.LEVERAGE);
          }}
          disabled={
            collateralAmount === undefined && collateralAmount === BigInt(0)
          }
        >
          <Image src={leverageIcon} alt="LeverageIcon" />
          <span>Leverage</span>
          <div className="hover-icon">
            <Image src={ChevronDownPrimary} alt="ChevronDown" />
          </div>
        </ActionButton>
        <ActionButton
          active={activeAction === FarmActionMode.BORROW}
          onClick={() => {
            setActiveAction(FarmActionMode.BORROW);
          }}
          disabled={
            collateralAmount === undefined && collateralAmount === BigInt(0)
          }
        >
          <Image src={borrowIcon} alt="BorrowIcon" />
          <span>Loan</span>
          <div className="hover-icon">
            <Image src={ChevronDownPrimary} alt="ChevronDown" />
          </div>
        </ActionButton>
      </ButtonsWrapper>
      <Collapse isOpened={activeAction !== undefined ? true : false}>
        <ActionPannel />
      </Collapse>
    </Card>
  );
};

export default ActionsCard;
