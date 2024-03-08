import React, { FC, useContext } from "react";
import { ConnectCard, ConnectWalletLabel } from "./ConnectWalletCard.styled";
import { MainContext } from "@/context/Main.context";
import Card from "@/components/Card/Card";
import Title from "@/components/Title/Title";
import Button from "@/components/Button/Button";
import { PriorityLevel } from "@/utils/types/enums";

type ConnectWalletCardProps = {
  title: string;
  subtitle: string;
};

const ConnectWalletCard: FC<ConnectWalletCardProps> = ({ title, subtitle }) => {
  const { setshowPopupConnection } = useContext(MainContext);

  return (
    <Card>
      <ConnectCard>
        <Title priority={4} label={title} />
        <ConnectWalletLabel>{subtitle}</ConnectWalletLabel>
        <Button
          priority={PriorityLevel.SECONDARY}
          label="Connect Wallet"
          onClick={() => {
            setshowPopupConnection(true);
          }}
          padding="1rem 2rem"
          width="fit-content"
        />
      </ConnectCard>
    </Card>
  );
};

export default ConnectWalletCard;
