import { bigIntToDecimal } from "../../utils/helpers/main.helpers";
import {
  getMaximumBorrow,
  getMaximumRepayToken,
} from "../../utils/helpers/borrow.helpers";

describe("bigIntToDecimal test", () => {
  test("result should be 1", () => {
    const grandNombre = BigInt(1000000000000000000);
    expect(bigIntToDecimal(grandNombre, 18)).toBe(1);
  });
});

describe("Max borrow", () => {
  const setup_borrow = {
    token: "a",
    loanA: 150,
    loanB: 0,
    blt: 1.058,
    ult: 1.161,
    buffer: 0.1,
    tokenA_Lprice: 1.001477982951784,
    tokenB_Lprice: 1.0017877743568946,
    tokenA_price: 0.999708,
    tokenB_price: 1,
    collateral: 401.88,
  };
  test("Max borrow with loan", () => {
    let maxBorrow = getMaximumBorrow(
      setup_borrow.token,
      setup_borrow.loanA,
      setup_borrow.loanB,
      setup_borrow.blt,
      setup_borrow.ult,
      setup_borrow.buffer,
      setup_borrow.tokenA_Lprice,
      setup_borrow.tokenB_Lprice,
      setup_borrow.tokenA_price,
      setup_borrow.tokenB_price,
      setup_borrow.collateral
    );
    expect(maxBorrow).toBe(164.55191718091484);
  });
  test("Max borrow without loan", () => {
    let loanAtest = 0;
    let maxBorrow = getMaximumBorrow(
      setup_borrow.token,
      loanAtest,
      setup_borrow.loanB,
      setup_borrow.blt,
      setup_borrow.ult,
      setup_borrow.buffer,
      setup_borrow.tokenA_Lprice,
      setup_borrow.tokenB_Lprice,
      setup_borrow.tokenA_price,
      setup_borrow.tokenB_price,
      setup_borrow.collateral
    );
    expect(maxBorrow).toBe(314.7736146236824);
  });
});

describe("Max Repay", () => {
  test("it have loan", () => {
    let balanceWalletToken = 100;
    let loan = 10;
    expect(getMaximumRepayToken(loan, balanceWalletToken)).toBe(10);
  });
  test("it selected walletbalance", () => {
    let balanceWalletToken = 100;
    let loan = 1000;
    expect(getMaximumRepayToken(loan, balanceWalletToken)).toBe(100);
  });
});
