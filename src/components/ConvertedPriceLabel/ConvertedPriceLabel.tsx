import React, { FC, useMemo } from "react";
import { Label } from "./ConvertedPriceLabel.styled";
import { securdFormat } from "@/utils/helpers/numberFormat.helpers";

type ConvertedPriceLabelProps = {
  amount: number | undefined;
  color?: string;
  fontSize?: string | undefined;
  price: number | undefined;
};

const ConvertedPriceLabel: FC<ConvertedPriceLabelProps> = ({
  amount,
  color,
  fontSize,
  price,
}) => {
  const totalAmout = useMemo(() => {
    if (amount !== undefined && price !== undefined) {
      return amount * price;
    }
  }, [amount, price]);
  return (
    <Label color={color} fontSize={fontSize}>
      {"$" + securdFormat(totalAmout)}
    </Label>
  );
};

export default ConvertedPriceLabel;
