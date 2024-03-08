import React, { useState } from "react";
import { PairAsset, PairSelectorContainer } from "./PairSelector.styled";

type PairSelectorProps = {
  pairArray: Array<string>;
  onSelectedPair: (arg0: any) => void;
};

const PairSelector = ({ pairArray, onSelectedPair }: PairSelectorProps) => {
  const [selectedPair, setSelectedPair] = useState(pairArray[0]);

  const onClickPair = (pair: string, index: number) => {
    onSelectedPair({ index, pair });
    setSelectedPair(pair);
  };
  return (
    <>
      <PairSelectorContainer>
        {pairArray.map((pair, key) => {
          return (
            <PairAsset
              onClick={() => {
                onClickPair(pair, key);
              }}
              key={key}
              selected={selectedPair === pair}
            >
              {pair}
            </PairAsset>
          );
        })}
      </PairSelectorContainer>
    </>
  );
};

export default PairSelector;
