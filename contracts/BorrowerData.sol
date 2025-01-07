// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./LendingPool.sol";
import "./AssetPriceOracle.sol";
import "./CollateralPriceOracle.sol";
import "./CollateralPool.sol";
import "./LiquidationThreshold.sol";
import "./libraries/CollateralPoolData.sol";

contract BorrowerData {
    using Math for uint256;

    address payable public lendingPool;
    address payable public collateralPool;
    AssetPriceOracle public assetPriceOracle;
    CollateralPriceOracle public collateralPriceOracle;
    LiquidationThreshold public liquidationThreshold;

    constructor(
        address payable lendingPool_,
        address payable collateralPool_,
        address assetPriceOracle_,
        address collateralPriceOracle_,
        address liquidationThreshold_
    ) payable {
        require(lendingPool_ != address(0), "Securd: zero address");
        require(collateralPool_ != address(0), "Securd: zero address");
        require(assetPriceOracle_ != address(0), "Securd: zero address");
        require(liquidationThreshold_ != address(0), "Securd: zero address");
        require(collateralPriceOracle_ != address(0), "Securd: zero address");
        lendingPool = lendingPool_;
        collateralPool = collateralPool_;
        assetPriceOracle = AssetPriceOracle(assetPriceOracle_);
        collateralPriceOracle = CollateralPriceOracle(collateralPriceOracle_);
        liquidationThreshold = LiquidationThreshold(liquidationThreshold_);
    }

    function getCollateralFactor(
        address borrower_,
        address token_
    ) public view returns (uint256 value_) {
        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );
        (, , uint256 loan_) = CollateralPool(collateralPool).getLoanValue(
            borrower_,
            token_
        );
        if (collateral_ == 0) {
            return 0;
        }
        if (loan_ == 0) {
            return MAX_VALUE;
        } else {
            value_ = (collateral_ * DECIMAL_FACTOR) / loan_;
        }
    }

    function getLeverageFactor(
        address borrower_,
        address token_
    ) external view returns (uint256) {
        (, , uint256 totalLoan_) = CollateralPool(collateralPool).getLoanValue(
            borrower_,
            token_
        );

        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );
        if (collateral_ == 0) {
            return 0;
        }
        if (totalLoan_ == 0) {
            return DECIMAL_FACTOR;
        } else {
            uint256 collateralFactor_ = CollateralPool(collateralPool)
                .getCollateralFactor(borrower_, token_);
            if (collateralFactor_ == DECIMAL_FACTOR) {
                return MAX_VALUE;
            } else if (collateralFactor_ < DECIMAL_FACTOR) {
                return 0;
            } else {
                return
                    (collateralFactor_ * DECIMAL_FACTOR) /
                    (collateralFactor_ - DECIMAL_FACTOR);
            }
        }
    }

    function getMaxLevereage(
        address borrower_,
        address token_
    ) public view returns (uint256 maxLevereage_) {
        (, , uint256 totalLoan_) = CollateralPool(collateralPool).getLoanValue(
            borrower_,
            token_
        );

        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );
        (, , uint256 collateralPrice_) = collateralPriceOracle
            .getCollateralPrice(token_);

        if (collateral_ == 0) {
            return 0;
        }
        uint256 maxIncrease_ = getMaxIncrease(borrower_, token_);
        maxLevereage_ =
            (collateral_ * DECIMAL_FACTOR + (maxIncrease_ * collateralPrice_)) /
            (collateral_ - totalLoan_);
    }

    function convertLevereageToIncreaseAmount(
        address borrower_,
        address token_
    ) external view returns (uint256 maxIncrease_) {
        (, , uint256 totalLoan_) = CollateralPool(collateralPool).getLoanValue(
            borrower_,
            token_
        );

        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );
        (, , uint256 collateralPrice_) = collateralPriceOracle
            .getCollateralPrice(token_);

        uint256 maxLeverage_ = getMaxLevereage(borrower_, token_);
        require(
            collateral_ >= totalLoan_,
            "securd :collateral is lower than loan"
        );
        maxIncrease_ =
            (maxLeverage_ * (collateral_ - totalLoan_)) /
            DECIMAL_FACTOR;
        require(maxIncrease_ >= collateral_, "securd :collateral is higher");
        maxIncrease_ = maxIncrease_ - collateral_;

        maxIncrease_ = (maxIncrease_ * DECIMAL_FACTOR) / collateralPrice_;
    }

    function getMaxRelease(
        address borrower_,
        address token_
    ) public view returns (uint256 maxRelease_) {
        uint256 collateralValue_ = CollateralPool(collateralPool)
            .getCollateralValue(borrower_, token_);
        if (collateralValue_ == 0) {
            return 0;
        }

        (uint256 loan0_, uint256 loan1_, uint256 totalLoan_) = CollateralPool(
            collateralPool
        ).getLoanValue(borrower_, token_);

        (, LiquidationThresholdInfo memory liquidationThresholdInfo_, , ) = (
            CollateralPool(collateralPool).collateralInfos(token_)
        );

        if (totalLoan_ != 0) {
            uint256 minCollateralFactor_ = liquidationThreshold
                .calculateLiquidationThreshold(
                    liquidationThresholdInfo_.balancedLoanThreshold_b,
                    liquidationThresholdInfo_.unBalancedLoanThreshold_b,
                    loan0_,
                    loan1_
                );

            uint256 minCollateralValue_ = (minCollateralFactor_ * totalLoan_) /
                DECIMAL_FACTOR;
            if (collateralValue_ >= minCollateralValue_) {
                maxRelease_ = collateralValue_ - minCollateralValue_;
            } else {
                return 0;
            }
        } else {
            maxRelease_ = collateralValue_;
        }
        (, , uint256 collateralPrice_) = collateralPriceOracle
            .getCollateralPrice(token_);
        require(collateralPrice_ != 0, "securd: collateral Price is zero");
        maxRelease_ = (collateralValue_ * DECIMAL_FACTOR) / collateralPrice_;
    }

    function getMaxIncrease(
        address borrower_,
        address token_
    ) public view returns (uint256 maxIncrease_) {
        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );
        if (collateral_ == 0) {
            return 0;
        }
        (uint256 loan0_, , uint256 totalLoan_) = CollateralPool(collateralPool)
            .getLoanValue(borrower_, token_);

        (uint256 borrowerBalance_, , ) = CollateralPool(collateralPool)
            .borrowerBalances(borrower_, token_);

        (uint256 amount0_, uint256 amount1_) = collateralPriceOracle
            .getCollateralAmount(token_, borrowerBalance_);

        (
            TokenInfo memory tokenInfo_,
            LiquidationThresholdInfo memory liquidationThresholdInfo_,
            ,

        ) = CollateralPool(collateralPool).collateralInfos(token_);
        (, , uint256 collateralPrice_) = collateralPriceOracle
            .getCollateralPrice(token_);
        require(collateralPrice_ != 0, "securd: collateral Price is zero");
        if (totalLoan_ == 0) {
            return
                (collateral_ * DECIMAL_FACTOR * DECIMAL_FACTOR) /
                ((liquidationThresholdInfo_.balancedLoanThreshold_b -
                    DECIMAL_FACTOR) * collateralPrice_);
        } else {
            amount0_ =
                (amount0_ *
                    assetPriceOracle.getAssetPrice(tokenInfo_.assets[0])) /
                DECIMAL_FACTOR;
            amount1_ =
                (amount1_ *
                    assetPriceOracle.getAssetPrice(tokenInfo_.assets[1])) /
                DECIMAL_FACTOR;

            uint256 collateralRatio_ = (amount0_ * DECIMAL_FACTOR) /
                (collateral_);

            require(
                collateral_ >=
                    (liquidationThresholdInfo_.unBalancedLoanThreshold_b *
                        totalLoan_) /
                        DECIMAL_FACTOR,
                "securd: lower collateral"
            );
            maxIncrease_ =
                collateral_ -
                (liquidationThresholdInfo_.unBalancedLoanThreshold_b *
                    totalLoan_) /
                DECIMAL_FACTOR;
            maxIncrease_ +=
                ((liquidationThresholdInfo_.unBalancedLoanThreshold_b -
                    liquidationThresholdInfo_.balancedLoanThreshold_b) *
                    loan0_) /
                collateralRatio_;
            maxIncrease_ =
                (maxIncrease_ * DECIMAL_FACTOR) /
                (liquidationThresholdInfo_.balancedLoanThreshold_b -
                    DECIMAL_FACTOR);

            uint256 loanRatio_ = (loan0_ *
                DECIMAL_FACTOR +
                maxIncrease_ *
                collateralRatio_) / (totalLoan_ + maxIncrease_);
            if (loanRatio_ <= collateralRatio_) {
                maxIncrease_ =
                    (maxIncrease_ * DECIMAL_FACTOR) /
                    collateralPrice_;
            } else {
                uint256 amount_ = (liquidationThresholdInfo_
                    .balancedLoanThreshold_b -
                    ((collateralRatio_ *
                        liquidationThresholdInfo_.unBalancedLoanThreshold_b) /
                        DECIMAL_FACTOR) *
                    totalLoan_) / (DECIMAL_FACTOR - collateralRatio_);
                require(collateral_ >= amount_, "securd: lower collateral");
                maxIncrease_ = collateral_ - amount_;

                amount_ =
                    ((liquidationThresholdInfo_.unBalancedLoanThreshold_b -
                        liquidationThresholdInfo_.balancedLoanThreshold_b) *
                        loan0_) /
                    (DECIMAL_FACTOR - collateralRatio_);

                require(maxIncrease_ >= amount_, "securd: lower maxIncrease");

                maxIncrease_ -= amount_;
                maxIncrease_ =
                    (maxIncrease_ * DECIMAL_FACTOR) /
                    (liquidationThresholdInfo_.balancedLoanThreshold_b -
                        DECIMAL_FACTOR);
                maxIncrease_ =
                    (maxIncrease_ * DECIMAL_FACTOR) /
                    collateralPrice_;
            }
        }
    }

    function getMaxBorrowA(
        address borrower_,
        address token_
    ) public view returns (uint256 maxBorrowA_) {
        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );
        if (collateral_ == 0) {
            return 0;
        }

        (uint256 loan0_, uint256 loan1_, uint256 totalLoan_) = CollateralPool(
            collateralPool
        ).getLoanValue(borrower_, token_);

        (
            TokenInfo memory tokenInfo_,
            LiquidationThresholdInfo memory liquidationThresholdInfo_,
            ,

        ) = CollateralPool(collateralPool).collateralInfos(token_);

        uint256 assetPrice_ = assetPriceOracle.getAssetPrice(
            tokenInfo_.assets[0]
        );

        if (totalLoan_ == 0) {
            uint256 minCollateralFactor_ = liquidationThresholdInfo_
                .unBalancedLoanThreshold_b;
            return
                (collateral_ * DECIMAL_FACTOR * DECIMAL_FACTOR) /
                (minCollateralFactor_ * assetPrice_);
        } else {
            (uint256 borrowerBalance_, , ) = CollateralPool(collateralPool)
                .borrowerBalances(borrower_, token_);

            (uint256 amount0_, uint256 amount1_) = collateralPriceOracle
                .getCollateralAmount(token_, borrowerBalance_);

            amount0_ =
                (amount0_ *
                    assetPriceOracle.getAssetPrice(tokenInfo_.assets[0])) /
                DECIMAL_FACTOR;
            amount1_ =
                (amount1_ *
                    assetPriceOracle.getAssetPrice(tokenInfo_.assets[1])) /
                DECIMAL_FACTOR;

            uint256 collateralRatio_ = (amount0_ * DECIMAL_FACTOR) /
                (collateral_);

            require(
                collateral_ >=
                    (liquidationThresholdInfo_.unBalancedLoanThreshold_b *
                        loan1_) /
                        DECIMAL_FACTOR,
                "securd: lower collateral"
            );

            maxBorrowA_ =
                collateral_ -
                (liquidationThresholdInfo_.unBalancedLoanThreshold_b * loan1_) /
                DECIMAL_FACTOR;
            maxBorrowA_ =
                (maxBorrowA_ * collateralRatio_) /
                (liquidationThresholdInfo_.balancedLoanThreshold_b -
                    ((DECIMAL_FACTOR - collateralRatio_) *
                        liquidationThresholdInfo_.unBalancedLoanThreshold_b) /
                    DECIMAL_FACTOR);
            require(maxBorrowA_ >= loan0_, "securd: lower maxBorrowA");

            maxBorrowA_ -= loan0_;
            uint256 loanRatio_ = ((loan0_ + maxBorrowA_) * DECIMAL_FACTOR) /
                (totalLoan_ + maxBorrowA_);
            if (loanRatio_ <= collateralRatio_) {
                maxBorrowA_ = (maxBorrowA_ * DECIMAL_FACTOR) / assetPrice_;
            } else {
                require(
                    liquidationThresholdInfo_.balancedLoanThreshold_b >=
                        (collateralRatio_ *
                            liquidationThresholdInfo_
                                .unBalancedLoanThreshold_b) /
                            DECIMAL_FACTOR,
                    "securd: lower collateralRatio"
                );
                maxBorrowA_ =
                    ((liquidationThresholdInfo_.balancedLoanThreshold_b -
                        ((collateralRatio_ *
                            liquidationThresholdInfo_
                                .unBalancedLoanThreshold_b) / DECIMAL_FACTOR)) *
                        loan1_) /
                    (DECIMAL_FACTOR - collateralRatio_);

                require(collateral_ >= maxBorrowA_, "securd: lower collateral");
                maxBorrowA_ =
                    ((collateral_ - maxBorrowA_) * DECIMAL_FACTOR) /
                    liquidationThresholdInfo_.unBalancedLoanThreshold_b;

                require(maxBorrowA_ >= loan0_, "securd: maxBorrowA");
                maxBorrowA_ =
                    ((maxBorrowA_ - loan0_) * DECIMAL_FACTOR) /
                    assetPrice_;
            }
        }
    }

    function getMaxBorrowB(
        address borrower_,
        address token_
    ) public view returns (uint256 maxBorrowB_) {
        (uint256 loan0_, uint256 loan1_, uint256 totalLoan_) = CollateralPool(
            collateralPool
        ).getLoanValue(borrower_, token_);

        uint256 collateral_ = CollateralPool(collateralPool).getCollateralValue(
            borrower_,
            token_
        );

        if (collateral_ == 0) {
            return 0;
        }

        (uint256 borrowerBalance_, , ) = CollateralPool(collateralPool)
            .borrowerBalances(borrower_, token_);

        (uint256 amount0_, uint256 amount1_) = collateralPriceOracle
            .getCollateralAmount(token_, borrowerBalance_);

        (
            TokenInfo memory tokenInfo_,
            LiquidationThresholdInfo memory liquidationThresholdInfo_,
            ,

        ) = CollateralPool(collateralPool).collateralInfos(token_);
        uint256 assetPrice_ = assetPriceOracle.getAssetPrice(
            tokenInfo_.assets[1]
        );

        if (totalLoan_ == 0) {
            uint256 minCollateralFactor_ = liquidationThresholdInfo_
                .unBalancedLoanThreshold_b;
            return
                (collateral_ * DECIMAL_FACTOR * DECIMAL_FACTOR) /
                (minCollateralFactor_ * assetPrice_);
        } else {
            amount0_ =
                (amount0_ *
                    assetPriceOracle.getAssetPrice(tokenInfo_.assets[0])) /
                DECIMAL_FACTOR;
            amount1_ =
                (amount1_ *
                    assetPriceOracle.getAssetPrice(tokenInfo_.assets[1])) /
                DECIMAL_FACTOR;
            uint256 collateralRatio_ = (amount1_ * DECIMAL_FACTOR) /
                (collateral_);
            require(
                collateral_ >=
                    (liquidationThresholdInfo_.unBalancedLoanThreshold_b *
                        loan0_) /
                        DECIMAL_FACTOR,
                "securd: lower collateral"
            );

            maxBorrowB_ =
                collateral_ -
                (liquidationThresholdInfo_.unBalancedLoanThreshold_b * loan0_) /
                DECIMAL_FACTOR;
            maxBorrowB_ =
                (maxBorrowB_ * collateralRatio_) /
                (liquidationThresholdInfo_.balancedLoanThreshold_b -
                    ((DECIMAL_FACTOR - collateralRatio_) *
                        liquidationThresholdInfo_.unBalancedLoanThreshold_b) /
                    DECIMAL_FACTOR);
            require(maxBorrowB_ >= loan1_, "securd: lower maxBorrowA");
            maxBorrowB_ -= loan1_;
            uint256 loanRatio_ = ((loan1_ + maxBorrowB_) * DECIMAL_FACTOR) /
                (totalLoan_ + maxBorrowB_);
            if (loanRatio_ <= collateralRatio_) {
                maxBorrowB_ = (maxBorrowB_ * DECIMAL_FACTOR) / assetPrice_;
            } else {
                require(
                    liquidationThresholdInfo_.balancedLoanThreshold_b >=
                        (collateralRatio_ *
                            liquidationThresholdInfo_
                                .unBalancedLoanThreshold_b) /
                            DECIMAL_FACTOR,
                    "securd: lower CollateralRatio"
                );
                maxBorrowB_ =
                    ((liquidationThresholdInfo_.balancedLoanThreshold_b -
                        ((collateralRatio_ *
                            liquidationThresholdInfo_
                                .unBalancedLoanThreshold_b) / DECIMAL_FACTOR)) *
                        loan0_) /
                    (DECIMAL_FACTOR - collateralRatio_);

                require(collateral_ >= maxBorrowB_, "securd: lower collateral");
                maxBorrowB_ =
                    ((collateral_ - maxBorrowB_) * DECIMAL_FACTOR) /
                    liquidationThresholdInfo_.unBalancedLoanThreshold_b;

                require(maxBorrowB_ >= loan1_, "securd: maxBorrowA");
                maxBorrowB_ =
                    ((maxBorrowB_ - loan1_) * DECIMAL_FACTOR) /
                    assetPrice_;
            }
        }
    }

    function getPositionData(
        DataIn memory dataIn_
    ) public view returns (DataOut memory data_) {
        (, , uint256 tokenPrice_) = collateralPriceOracle.getCollateralPrice(
            dataIn_.token
        );
        (uint256 collateral_, uint256 debt0_, uint256 debt1_) = CollateralPool(
            collateralPool
        ).borrowerBalances(dataIn_.borrower, dataIn_.token);
        if (dataIn_.direction) {
            data_.collateral = collateral_ + dataIn_.amount;
        } else {
            require(collateral_ >= dataIn_.amount, "max amount");
            data_.collateral = collateral_ - dataIn_.amount;
        }
        data_.collateralValue =
            (tokenPrice_ * data_.collateral) /
            DECIMAL_FACTOR;

        (TokenInfo memory tokenInfo_, , , ) = CollateralPool(collateralPool)
            .collateralInfos(dataIn_.token);
        address asset_;
        uint256 lTokenPrice_;
        asset_ = tokenInfo_.assets[0];
        (lTokenPrice_, ) = LendingPool(lendingPool).getTokenPrice(asset_);
        if (dataIn_.direction0) {
            data_.debt0 =
                ((lTokenPrice_ * debt0_) / DECIMAL_FACTOR) +
                dataIn_.amount0;
        } else {
            require(
                ((lTokenPrice_ * debt0_) / DECIMAL_FACTOR) >= dataIn_.amount0,
                "max amount"
            );
            data_.debt0 =
                ((lTokenPrice_ * debt0_) / DECIMAL_FACTOR) -
                dataIn_.amount0;
        }
        data_.debtValue0 =
            (assetPriceOracle.getAssetPrice(asset_) * data_.debt0) /
            DECIMAL_FACTOR;

        asset_ = tokenInfo_.assets[1];
        (lTokenPrice_, ) = LendingPool(lendingPool).getTokenPrice(asset_);
        if (dataIn_.direction1) {
            data_.debt1 =
                ((lTokenPrice_ * debt1_) / DECIMAL_FACTOR) +
                dataIn_.amount1;
        } else {
            require(
                ((lTokenPrice_ * debt1_) / DECIMAL_FACTOR) >= dataIn_.amount1,
                "max amount"
            );
            data_.debt1 =
                ((lTokenPrice_ * debt1_) / DECIMAL_FACTOR) -
                dataIn_.amount1;
        }
        data_.debtValue1 =
            (assetPriceOracle.getAssetPrice(asset_) * data_.debt1) /
            DECIMAL_FACTOR;

        if ((data_.debtValue0 + data_.debtValue1) != 0) {
            data_.collateralFactor =
                (data_.collateralValue * DECIMAL_FACTOR) /
                (data_.debtValue0 + data_.debtValue1);
        } else {
            data_.collateralFactor = MAX_VALUE;
        }

        (
            ,
            LiquidationThresholdInfo memory liquidationThresholdInfo_,
            ,

        ) = CollateralPool(collateralPool).collateralInfos(dataIn_.token);

        (data_.liquidationFactor) = liquidationThreshold
            .calculateLiquidationThreshold(
                liquidationThresholdInfo_.balancedLoanThreshold_0,
                liquidationThresholdInfo_.unBalancedLoanThreshold_0,
                data_.debtValue0,
                data_.debtValue1
            );
        if (data_.collateralFactor == DECIMAL_FACTOR) {
            data_.leverageFactor = MAX_VALUE;
        } else if (data_.collateralFactor < DECIMAL_FACTOR) {
            data_.leverageFactor = 0;
        } else {
            data_.leverageFactor =
                (data_.collateralFactor * DECIMAL_FACTOR) /
                (data_.collateralFactor - DECIMAL_FACTOR);
        }
    }
}