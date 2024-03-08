import React, {
  FC,
  useContext,
  useMemo,
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Collapse } from "react-collapse";
import { FarmContext } from "@/context/Farm.context";
import {
  AmountInputWrapper,
  AssetWrapper,
  Input,
  ChoiceToken,
  AssetWrapperOnly,
} from "./AmountInput.styled";
import Arrow from "@/assets/icons/Arrow";
import { FarmActionMode } from "@/utils/types/enums";
import CryptoLogo from "../CryptoLogo/CryptoLogo";
import CryptoSerie from "../CryptoSerie/CryptoSerie";
import Title from "../Title/Title";
import { securdFormat } from "@/utils/helpers/numberFormat.helpers";

type AmountInputProps = {
  cryptos: string[];
  tokenSymbols: string[];
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  register?: UseFormRegister<any>;
  required?: boolean;
  setValue?: UseFormSetValue<any>;
  value?: number;
  actionMode?: string | number;
};

const AmountInput: FC<AmountInputProps> = ({
  cryptos,
  tokenSymbols,
  defaultValue,
  min,
  max,
  onChange,
  register,
  required,
  setValue,
  value,
  actionMode,
}) => {
  const { tokenSelected, setTokenSelected, activeAction } =
    useContext(FarmContext);

  const [tokenSelectection, setTokenSelection] = useState<boolean>(false);

  const styleCollapse = useMemo(() => {
    if (tokenSelectection) {
      return { height: "auto", overflow: "initial" };
    } else {
      return {
        height: "0px",
        overflow: "hidden",
        position: "absolute",
        transform: "translateY(100%)",
      };
    }
  }, [tokenSelectection]);

  useEffect(() => {
    if (setValue) {
      value ? setValue("amount", value) : setValue("amount", "");
    }
  }, [value]);

  return (
    <AmountInputWrapper>
      <AssetWrapper
        activeAction={activeAction}
        onClick={() => {
          setTokenSelection((prev) => !prev);
        }}
      >
        {cryptos.length === 1 ? (
          <>
            <AssetWrapperOnly>
              <CryptoLogo crypto={cryptos[0]} width={30} height={30} />
              <Title priority={4} label={tokenSymbols[0]} />
            </AssetWrapperOnly>
          </>
        ) : (
          cryptos.length > 1 && (
            <>
              {activeAction !== FarmActionMode.BORROW ? (
                <>
                  <CryptoSerie cryptos={cryptos} />
                  <Title
                    priority={4}
                    label={tokenSymbols[0] + "/" + tokenSymbols[1]}
                  />
                </>
              ) : (
                <AssetWrapperOnly>
                  <CryptoLogo
                    crypto={cryptos[tokenSelected]}
                    width={30}
                    height={30}
                  />
                  <Title priority={4} label={tokenSymbols[0]} />
                  <Arrow tokenSelectection={tokenSelectection} />
                </AssetWrapperOnly>
              )}
            </>
          )
        )}
        {cryptos.length === 2 && activeAction === FarmActionMode.BORROW && (
          <Collapse isOpened={tokenSelectection} initialStyle={styleCollapse}>
            <ChoiceToken>
              {tokenSelected !== 0 && (
                <AssetWrapperOnly
                  marginTop=".4rem"
                  tokenSelectection={tokenSelectection}
                  onClick={() => {
                    setTokenSelected(0);
                  }}
                >
                  <CryptoLogo crypto={cryptos[0]} width={30} height={30} />
                  <Title priority={4} label={tokenSymbols[0]} />
                </AssetWrapperOnly>
              )}
              {tokenSelected !== 1 && (
                <AssetWrapperOnly
                  marginTop=".4rem"
                  tokenSelectection={tokenSelectection}
                  onClick={() => {
                    setTokenSelected(1);
                  }}
                >
                  <CryptoLogo crypto={cryptos[1]} width={30} height={30} />
                  <Title priority={4} label={tokenSymbols[1]} />
                </AssetWrapperOnly>
              )}
            </ChoiceToken>
          </Collapse>
        )}
      </AssetWrapper>

      <Input
        type="number"
        placeholder="Amount"
        defaultValue={isNaN(defaultValue as number) ? "" : defaultValue}
        step="any"
        {...(register &&
          register("amount", {
            onChange: onChange,
            required: {
              value: required || false,
              message: "Please enter an amount",
            },
            max: max && {
              value: max,
              message: `You cannot ${actionMode} more than you have in your balance ${securdFormat(
                max,
                2
              )}.`,
            },
            min: {
              value: min || 0,
              message: `Please enter an amount greater than ${min || 0}.`,
            },
            value: isNaN(value as number) ? "" : value,
            valueAsNumber: true,
          }))}
      />
    </AmountInputWrapper>
  );
};

export default AmountInput;
