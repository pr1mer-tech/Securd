// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./libraries/ConstantLib.sol";

contract LiquidationThreshold {
    function calculateLiquidationThreshold(
        uint256 balancedLoanThreshold_,
        uint256 unBalancedLoanThreshold_,
        uint256 loan0_,
        uint256 loan1_
    )
        external
        pure
        returns (uint256 liquidationThreshold_)
    {
        require((loan0_ + loan1_) !=0, "total loan value is zero");
        uint256 loanRate_ = (loan0_ * DECIMAL_FACTOR) / (loan0_ + loan1_);

        uint256 balancedLiquidationThreshold_ = 2 *
            Math.min(loanRate_, DECIMAL_FACTOR - loanRate_);
          liquidationThreshold_ =
            balancedLiquidationThreshold_ *
            balancedLoanThreshold_ +
            (DECIMAL_FACTOR - balancedLiquidationThreshold_) *
            unBalancedLoanThreshold_;
        liquidationThreshold_ = liquidationThreshold_ / DECIMAL_FACTOR;
    }
}
