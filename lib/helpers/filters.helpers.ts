import type { LenderPool, BorrowerPool } from "../api/generated/schemas";
import { CollateralInfos } from "../types/farm.types";
import type { Coins, ReserveInfo, SaveSortsProps } from "../types/save.types";
import { getPoolSize, getSavingApy } from "./lenderPool.helpers";

export const filterSearch = (
  search: string,
  lenderPools: LenderPool[] | undefined
) => {
  if (search === "") return lenderPools;
  return lenderPools?.filter((pool) =>
    pool.asset.fa12?.symbol?.toUpperCase().includes(search.toUpperCase())
  );
};

export const sortByAccounts = (
  sortAccounts: SaveSortsProps,
  reservesInfo: ReserveInfo[],
  coinsPrice: Coins
) => {
  if (sortAccounts.apy === false && sortAccounts.poolSize === false) {
    return reservesInfo;
  }
  let accountsSorted;
  if (sortAccounts.poolSize && reservesInfo !== undefined) {
    accountsSorted = [...reservesInfo]?.sort(
      (a, b) =>
        (getPoolSize(b, coinsPrice) || 0) - (getPoolSize(a, coinsPrice) || 0)
    );
  }
  if (sortAccounts.apy && reservesInfo !== undefined) {
    accountsSorted = [...reservesInfo]?.sort((a, b) => {
      return (getSavingApy(b) || 0) - (getSavingApy(a) || 0);
    });
  }
  return accountsSorted;
};

export const filterSearchBorrow = (
  search: string,
  borrowPools?: BorrowerPool[]
) => {
  if (search === "") return borrowPools;
  return borrowPools?.filter(
    (pair: BorrowerPool) =>
      pair.lenderpool_set[0].asset.fa12?.symbol
        ?.toUpperCase()
        .includes(search.toUpperCase()) ||
      pair.lenderpool_set[1].asset.fa12?.symbol
        ?.toUpperCase()
        .includes(search.toUpperCase())
  );
};

export const sortByAccountsBorrow = (
  sortAccounts: SaveSortsProps,
  BorrowerPools: BorrowerPool[] | undefined
) => {
  if (sortAccounts.apy === false && sortAccounts.poolSize === false) {
    return BorrowerPools;
  }
  let accountsSorted;
  if (sortAccounts.poolSize && BorrowerPools !== undefined) {
    accountsSorted = [...BorrowerPools]?.sort(
      (a: BorrowerPool, b: BorrowerPool) => {
        return (b.data_contract.supply || 0) - (a.data_contract.supply || 0);
      }
    );
  }
  if (sortAccounts.apy && BorrowerPools !== undefined) {
    accountsSorted = [...BorrowerPools]?.sort(
      (a: BorrowerPool, b: BorrowerPool) => {
        return (Number(b.dex_apy) || 0) - (Number(a.dex_apy) || 0);
      }
    );
  }
  return accountsSorted;
};
