// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./LendingPool.sol";
import "./AssetPriceOracle.sol";
import "./CollateralPriceOracle.sol";
import "./libraries/AssetTransfer.sol";
import "./libraries/CollateralPoolData.sol";
import "./LiquidationThreshold.sol";

contract CollateralPool is AccessControlEnumerable, Pausable {
    using Math for uint256;


    mapping(address => CollateralInfo) public collateralInfos;
    mapping(address => mapping(address => BorrowerBalance))
        public borrowerBalances;
    address payable public lendingPool;
    AssetPriceOracle public assetPriceOracle;
    CollateralPriceOracle public collateralPriceOracle;
    LiquidationThreshold public liquidationThreshold;
    event AddLPToken(address indexed token_, TokenInfo tokenInfo_);
    event Supply(address indexed to_, address indexed token_, uint256 amount_);
    event Withdraw(
        address indexed caller_,
        address indexed token_,
        uint256 amount_
    );
    event Borrow(
        address indexed caller_,
        address indexed token_,
        address indexed asset_,
        uint256 amount_
    );
    event Repay(
        address indexed token_,
        address indexed asset_,
        uint256 amount_,
        address indexed to_
    );
    event Deleverage(
        address indexed caller_,
        address indexed token_,
        uint256 amount_
    );
    event Leverage(
        address indexed caller_,
        address indexed token_,
        uint256 amount_
    );

    constructor(
        address admin_,
        address payable lendingPool_,
        address assetPriceOracle_,
        address collateralPriceOracle_,
        address liquidationThreshold_
    ) payable {
        require(admin_ != address(0), "Securd: zero address");
        require(lendingPool_ != address(0), "Securd: zero address");
        require(assetPriceOracle_ != address(0), "Securd: zero address");
        require(liquidationThreshold_ != address(0), "Securd: zero address");
        require(lendingPool_ != address(0), "Securd: zero address");
        lendingPool = lendingPool_;
        assetPriceOracle = AssetPriceOracle(assetPriceOracle_);
        collateralPriceOracle = CollateralPriceOracle(collateralPriceOracle_);
        liquidationThreshold = LiquidationThreshold(liquidationThreshold_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    }

    function _updateParams(address asset_) internal {
        LendingPool(lendingPool).updateModelParams(asset_);
    }

    receive() external payable {}

    function addLPToken(
        address token_,
        TokenInfo memory tokenInfo_,
        LiquidationThresholdInfo memory liquidationThresholdInfo_,
        uint256 liquidationPremuim_
    ) external {
        require(
            !collateralInfos[token_].isActivated,
            "Securd: token is already existed"
        );
        require(tokenInfo_.router != address(0), "Securd: zero address");
        require(
            tokenInfo_.assets.length == tokenInfo_.nbAssets,
            "Securd: number of assets is wrong"
        );
        collateralInfos[token_].tokenInfo = tokenInfo_;
        collateralInfos[token_].liquidationPremuim = liquidationPremuim_;
        collateralInfos[token_]
            .liquidationThresholdInfo = liquidationThresholdInfo_;
        collateralInfos[token_].isActivated = true;
        emit AddLPToken(token_, tokenInfo_);
    }

    function supply(
        address token_,
        uint256 amount_,
        address to_
    ) external whenNotPaused {
        require(to_ != address(0), "securd: zero address");
        require(amount_ != 0, "securd: zero amount");
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(collateralInfo_.isActivated, "securd: LP token is not listed");
        _updateParams(collateralInfo_.tokenInfo.assets[0]);
        _updateParams(collateralInfo_.tokenInfo.assets[1]);
        (, , uint256 totalLoan_) = getLoanValue(to_, token_);
        if (totalLoan_ != 0) {
            (bool isLiquidable_, ) = isLiquidablePosition(to_, token_);
            require(
                !isLiquidable_,
                "Securd: borrower's position is liquidable"
            ); // verifier par rapport aave
        }
        AssetTransfer.transferFrom(
            msg.sender,
            address(this),
            amount_,
            IERC20(token_)
        );
        borrowerBalances[to_][token_].collateral += amount_;
        emit Supply(to_, token_, amount_);
    }

    function withdraw(address token_, uint256 amount_, address to_) external {
        require(to_ != address(0), "securd: zero address");
        require(amount_ != 0, "securd: zero amount");
        BorrowerBalance storage borrowerBalance_ = borrowerBalances[msg.sender][
            token_
        ];
        require(
            borrowerBalance_.collateral >= amount_,
            "Securd: amount exceeds balance"
        );
        unchecked {
            borrowerBalance_.collateral -= amount_;
        }

        TokenInfo memory tokenInfo_ = collateralInfos[token_].tokenInfo;
        _updateParams(tokenInfo_.assets[0]);
        _updateParams(tokenInfo_.assets[1]);
        (, , uint256 totalLoan_) = getLoanValue(msg.sender, token_);
        if (totalLoan_ != 0) {
            CheckLoanCondition(msg.sender, token_);
        }
        AssetTransfer.transfer(to_, amount_, token_);
        emit Withdraw(msg.sender, token_, amount_);
    }

    function borrow(
        address token_,
        address asset_,
        uint256 amount_,
        address to_
    ) external payable {
        require(to_ != address(0), "securd: zero address");
        require(amount_ != 0, "securd: zero amount");

        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(collateralInfo_.isActivated, "securd: LP token is not listed");
        require(
            (_convertAsset(token_, asset_) == collateralInfo_.tokenInfo.assets[0]) ||
                (_convertAsset(token_, asset_) == collateralInfo_.tokenInfo.assets[1]),
            "securd: no asset"
        );

        BorrowerBalance storage borrowerBalance_ = borrowerBalances[msg.sender][
            token_
        ];
        _updateParams(asset_);
        (uint256 price_, ) = LendingPool(lendingPool).getTokenPrice(asset_);
        uint256 lTokenAmount_ = (amount_ * DECIMAL_FACTOR) / price_;
        if (asset_ == collateralInfo_.tokenInfo.assets[0]) {
            borrowerBalance_.debt0 += lTokenAmount_;
        } else {
            borrowerBalance_.debt1 += lTokenAmount_;
        }
        CheckLoanCondition(msg.sender, token_);
        LendingPool(lendingPool).mintOrBurnLToken(
            token_,
            asset_,
            lTokenAmount_,
            amount_,
            msg.sender,
            true
        );
        LendingPool(lendingPool).sendAsset(token_, asset_, amount_, to_);
        emit Borrow(msg.sender, token_, asset_, amount_);
    }

    function repay(
        address token_,
        address asset_,
        uint256 amount_,
        address to_
    ) external payable {
        require(to_ != address(0), "securd: zero address");
        require(amount_ != 0, "securd: zero amount");
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(
            (_convertAsset(token_, asset_) == collateralInfo_.tokenInfo.assets[0]) ||
                (_convertAsset(token_, asset_) == collateralInfo_.tokenInfo.assets[1]),
            "securd: no asset"
        );
        _updateParams(asset_);
        (uint256 loan0_, uint256 loan1_, uint256 totalLoan_) = getLoanValue(
            to_,
            token_
        );
        if (totalLoan_ != 0) {
            (bool isLiquidable_, ) = isLiquidablePosition(to_, token_);
            require(
                !isLiquidable_,
                "Securd: borrower's position is liquidable"
            );
        }
        (uint256 price_, ) = LendingPool(lendingPool).getTokenPrice(asset_);
        uint256 lTokenAmount_ = (amount_ * DECIMAL_FACTOR) / price_;
        BorrowerBalance storage borrowerBalance_ = borrowerBalances[to_][
            token_
        ];
        uint256 amountToRepayLToken_;
        uint256 amountToRepayAsset_;
        if (asset_ == collateralInfo_.tokenInfo.assets[0]) {
            require(loan0_ != 0, "securd: no loan to repay");
            amountToRepayLToken_ = Math.min(
                borrowerBalance_.debt0,
                lTokenAmount_
            );
            borrowerBalance_.debt0 -= amountToRepayLToken_;
            amountToRepayAsset_ =
                (amountToRepayLToken_ * price_) /
                DECIMAL_FACTOR;
        } else {
            require(loan1_ != 0, "securd: no loan to repay");
            amountToRepayLToken_ = Math.min(
                borrowerBalance_.debt1,
                lTokenAmount_
            );
            borrowerBalance_.debt1 -= amountToRepayLToken_;
            amountToRepayAsset_ =
                (amountToRepayLToken_ * price_) /
                DECIMAL_FACTOR;
        }

        LendingPool(lendingPool).mintOrBurnLToken(
            token_,
            asset_,
            amountToRepayLToken_,
            amountToRepayAsset_,
            to_,
            false
        );

        if (asset_ != address(0)) {
            AssetTransfer.transferFrom(
                msg.sender,
                lendingPool,
                amountToRepayAsset_,
                IERC20(asset_)
            );
        } else {
            require((msg.value == amount_), "Securd: no required amount");
            payable(lendingPool).transfer(amountToRepayAsset_);
            payable(msg.sender).transfer(amount_ - amountToRepayAsset_);
        }
        emit Repay(token_, asset_, amountToRepayAsset_, to_);
    }

    function leverage(address token_, uint256 amount_) external payable {
        require(amount_ != 0, "Securd: zero amount");
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(collateralInfo_.isActivated, "securd: LP token is not listed");
        BorrowerBalance storage borrowerBalance_ = borrowerBalances[msg.sender][
            token_
        ];
        (uint256 amount0_, uint256 amount1_) = collateralPriceOracle
            .getCollateralAmount(token_, amount_);

        _updateParams(collateralInfo_.tokenInfo.assets[0]);
        _updateParams(collateralInfo_.tokenInfo.assets[1]);

        (uint256 price0_, ) = LendingPool(lendingPool).getTokenPrice(
            collateralInfo_.tokenInfo.assets[0]
        );
        (uint256 price1_, ) = LendingPool(lendingPool).getTokenPrice(
            collateralInfo_.tokenInfo.assets[1]
        );

         LendingPool(lendingPool).sendAsset(
            token_,
            collateralInfo_.tokenInfo.assets[0],
            amount0_,
            address(this)
        );
        LendingPool(lendingPool).sendAsset(
            token_,
            collateralInfo_.tokenInfo.assets[1],
            amount1_,
            address(this)
        );
        uint256 liquidity_;
        (amount0_, amount1_, liquidity_) = _addLiquidity(
            token_,
            amount0_,
            amount1_
        );
        uint256 amountLToken0 = (amount0_ * DECIMAL_FACTOR) / price0_;
        borrowerBalance_.debt0 += amountLToken0;
        uint256 amountLToken1 = (amount1_ * DECIMAL_FACTOR) / price1_;
        borrowerBalance_.debt1 += amountLToken1;
        borrowerBalance_.collateral += liquidity_;
        CheckLoanCondition(msg.sender, token_);

        LendingPool(lendingPool).mintOrBurnLToken(
            token_,
            collateralInfo_.tokenInfo.assets[0],
            amountLToken0,
            amount0_,
            msg.sender,
            true
        );
        LendingPool(lendingPool).mintOrBurnLToken(
            token_,
            collateralInfo_.tokenInfo.assets[1],
            amountLToken1,
            amount1_,
            msg.sender,
            true
        );

        emit Leverage(msg.sender, token_, liquidity_);
    }

    function deleverage(address token_, uint256 amount_) external payable {
        BorrowerBalance storage borrowerBalance_ = borrowerBalances[msg.sender][
            token_
        ];
        require(
            borrowerBalance_.collateral >= amount_,
            "Securd: delevreage is not possible"
        );
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        _updateParams(collateralInfo_.tokenInfo.assets[0]);
        _updateParams(collateralInfo_.tokenInfo.assets[1]);
        (, , uint256 totalLoan_) = getLoanValue(msg.sender, token_);
        if (totalLoan_ != 0) {
            (bool isLiquidable_, ) = isLiquidablePosition(msg.sender, token_);
            require(
                !isLiquidable_,
                "Securd: borrower's position is liquidable"
            );
        }
        (uint256 amount0_, uint256 amount1_) = collateralPriceOracle
            .getCollateralAmount(token_, amount_);
        (uint256 price0_, ) = LendingPool(lendingPool).getTokenPrice(
            collateralInfo_.tokenInfo.assets[0]
        );
        (uint256 price1_, ) = LendingPool(lendingPool).getTokenPrice(
            collateralInfo_.tokenInfo.assets[1]
        );
        (amount0_, amount1_) = _removeLiquidity(token_, amount_);
        uint256 amountLToken0_ = (amount0_ * DECIMAL_FACTOR) / price0_;

        uint256 amountToRepay0_ = Math.min(
            amountLToken0_,
            borrowerBalance_.debt0
        );
        borrowerBalance_.debt0 -= amountToRepay0_;
        uint256 amountLToken1_ = (amount1_ * DECIMAL_FACTOR) / price1_;
        uint256 amountToRepay1_ = Math.min(
            amountLToken1_,
            borrowerBalance_.debt1
        );
        borrowerBalance_.debt1 -= amountToRepay1_;
        borrowerBalance_.collateral -= amount_;
        if (amountToRepay0_ != 0) {
            LendingPool(lendingPool).mintOrBurnLToken(
                token_,
                collateralInfo_.tokenInfo.assets[0],
                amountToRepay0_,
                (amountToRepay0_ * price0_) / DECIMAL_FACTOR,
                msg.sender,
                false
            );
        }
        if (amountToRepay1_ != 0) {
            LendingPool(lendingPool).mintOrBurnLToken(
                token_,
                collateralInfo_.tokenInfo.assets[1],
                amountToRepay1_,
                (amountToRepay1_ * price1_) / DECIMAL_FACTOR,
                msg.sender,
                false
            );
        }

        amount0_ =
            ((amountLToken0_ - amountToRepay0_) * price0_) /
            DECIMAL_FACTOR;
        amount1_ =
            ((amountLToken1_ - amountToRepay1_) * price1_) /
            DECIMAL_FACTOR;
        require(
            (amount0_ == 0 && amount1_ == 0) ||
                (borrowerBalance_.debt0 == 0 && borrowerBalance_.debt1 == 0),
            "securd: devevrage is not possible"
        );

        if (amount0_ != 0) {
            AssetTransfer.transfer(
                msg.sender,
                amount0_,
                collateralInfo_.tokenInfo.assets[0]
            );
        }

        if (amount1_ != 0) {
            AssetTransfer.transfer(
                msg.sender,
                amount1_,
                collateralInfo_.tokenInfo.assets[1]
            );
        }

        emit Deleverage(msg.sender, token_, amount_);
    }

    function getCollateralFactor(
        address borrower_,
        address token_
    ) public view returns (uint256 value_) {
        uint256 collateral_ = getCollateralValue(borrower_, token_);
        (, , uint256 loan_) = getLoanValue(borrower_, token_);
        require(loan_ != 0, "securd: loan value is zero");
        value_ = (collateral_ * DECIMAL_FACTOR) / loan_;
    }

    function getCollateralValue(
        address borrower_,
        address token_
    ) public view returns (uint256 value_) {
        (, , uint256 tokenPrice_) = collateralPriceOracle.getCollateralPrice(
            token_
        );
        BorrowerBalance storage borrowerBalance_ = borrowerBalances[borrower_][
            token_
        ];
        value_ = (tokenPrice_ * borrowerBalance_.collateral) / DECIMAL_FACTOR;
    }

    function getLoanValue(
        address borrower_,
        address token_
    ) public view returns (uint256 loan0_, uint256 loan1_, uint256 totalLoan_) {
        BorrowerBalance storage borrowerBalance_ = borrowerBalances[borrower_][
            token_
        ];
        TokenInfo memory tokenInfo_ = collateralInfos[token_].tokenInfo;
        address asset0_;
        address asset1_;
        uint256 lTokenPrice0_;
        asset0_ = tokenInfo_.assets[0];
        (lTokenPrice0_, ) = LendingPool(lendingPool).getTokenPrice(asset0_);
        loan0_ =
            (
                (assetPriceOracle.getAssetPrice(asset0_) *
                    lTokenPrice0_ *
                    borrowerBalance_.debt0)
            ) /
            (DECIMAL_FACTOR * DECIMAL_FACTOR);
        asset1_ = tokenInfo_.assets[1];
        uint256 lTokenPrice1_;
        (lTokenPrice1_, ) = LendingPool(lendingPool).getTokenPrice(asset1_);
        loan1_ =
            (
                (assetPriceOracle.getAssetPrice(asset1_) *
                    lTokenPrice1_ *
                    borrowerBalance_.debt1)
            ) /
            (DECIMAL_FACTOR * DECIMAL_FACTOR);
        totalLoan_ = (loan0_ + loan1_);
    }

    function CheckLoanCondition(
        address borrower_,
        address token_
    ) public view returns (bool) {
        uint256 collateralFactor_ = getCollateralFactor(borrower_, token_);
        (uint256 loan0_, uint256 loan1_, ) = getLoanValue(borrower_, token_);
        LiquidationThresholdInfo
            memory liquidationThresholdInfo_ = collateralInfos[token_]
                .liquidationThresholdInfo;
        (uint256 minCollateralFactor_) = liquidationThreshold
            .calculateLiquidationThreshold(
                liquidationThresholdInfo_.balancedLoanThreshold_b,
                liquidationThresholdInfo_.unBalancedLoanThreshold_b,
                loan0_,
                loan1_
            );
        require(
            collateralFactor_ >= minCollateralFactor_,
            "securd: low collateral Factor"
        );
        return true;
    }

    function isLiquidablePosition(
        address borrower_,
        address token_
    ) public view returns (bool isLiquidable_, uint256 liquidationThreshold_) {
        uint256 collateralFactor_ = getCollateralFactor(borrower_, token_);
        (uint256 loan0_, uint256 loan1_, ) = getLoanValue(borrower_, token_);
        LiquidationThresholdInfo
            memory liquidationThresholdInfo_ = collateralInfos[token_]
                .liquidationThresholdInfo;
        (liquidationThreshold_) = liquidationThreshold
            .calculateLiquidationThreshold(
                liquidationThresholdInfo_.balancedLoanThreshold_0,
                liquidationThresholdInfo_.unBalancedLoanThreshold_0,
                loan0_,
                loan1_
            );
        isLiquidable_ = (collateralFactor_ <= liquidationThreshold_);
    }

    function _removeLiquidity(
        address token_,
        uint256 amount_
    ) internal returns (uint256 amount0_, uint256 amount1_) {
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        IERC20(token_).approve(collateralInfo_.tokenInfo.router, amount_);
        if (
            (collateralInfo_.tokenInfo.assets[0] != address(0)) &&
            (collateralInfo_.tokenInfo.assets[1] != address(0))
        ) {
            (amount0_, amount1_) = IUniswapV2Router02(
                collateralInfo_.tokenInfo.router
            ).removeLiquidity(
                    collateralInfo_.tokenInfo.assets[0],
                    collateralInfo_.tokenInfo.assets[1],
                    amount_,
                    0,
                    0,
                    address(this),
                    block.timestamp
                );
        } else if (collateralInfo_.tokenInfo.assets[0] != address(0)) {
            (amount0_, amount1_) = IUniswapV2Router02(
                collateralInfo_.tokenInfo.router
            ).removeLiquidityETH(
                    collateralInfo_.tokenInfo.assets[0],
                    amount_,
                    0,
                    0,
                    address(this),
                    block.timestamp
                );
        } else {
            (amount1_, amount0_) = IUniswapV2Router02(
                collateralInfo_.tokenInfo.router
            ).removeLiquidityETH(
                    collateralInfo_.tokenInfo.assets[1],
                    amount_,
                    0,
                    0,
                    address(this),
                    block.timestamp
                );
        }
    }

    function _addLiquidity(
        address token_,
        uint256 amount0_,
        uint256 amount1_
    )
        internal
        returns (uint256 amount00_, uint256 amount11_, uint256 liquidity_)
    {
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        if (
            (collateralInfo_.tokenInfo.assets[0] != address(0)) &&
            (collateralInfo_.tokenInfo.assets[1] != address(0))
        ) {
            IERC20(collateralInfo_.tokenInfo.assets[0]).approve(
                collateralInfo_.tokenInfo.router,
                amount0_
            );
            IERC20(collateralInfo_.tokenInfo.assets[1]).approve(
                collateralInfo_.tokenInfo.router,
                amount1_
            );
            (amount00_, amount11_, liquidity_) = IUniswapV2Router02(
                collateralInfo_.tokenInfo.router
            ).addLiquidity(
                    collateralInfo_.tokenInfo.assets[0],
                    collateralInfo_.tokenInfo.assets[1],
                    amount0_,
                    amount1_,
                    0,
                    0,
                    address(this),
                    block.timestamp
                );
        } else if (collateralInfo_.tokenInfo.assets[0] != address(0)) {
            IERC20(collateralInfo_.tokenInfo.assets[0]).approve(
                collateralInfo_.tokenInfo.router,
                amount0_
            );
            (amount00_, amount11_, liquidity_) = IUniswapV2Router02(
                collateralInfo_.tokenInfo.router
            ).addLiquidityETH{value: amount1_}(
                collateralInfo_.tokenInfo.assets[0],
                amount0_,
                0,
                0,
                address(this),
                block.timestamp
            );
        } else {
            IERC20(collateralInfo_.tokenInfo.assets[1]).approve(
                collateralInfo_.tokenInfo.router,
                amount1_
            );
            (amount11_, amount00_, liquidity_) = IUniswapV2Router02(
                collateralInfo_.tokenInfo.router
            ).addLiquidityETH{value: amount0_}(
                collateralInfo_.tokenInfo.assets[1],
                amount1_,
                0,
                0,
                address(this),
                block.timestamp
            );
        }
    }

    function UpdateLiquidationThresholdInfo(
        address token_,
        LiquidationThresholdInfo memory liquidationThresholdInfo_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(collateralInfo_.isActivated, "securd: LP token is not listed");
        collateralInfos[token_]
            .liquidationThresholdInfo = liquidationThresholdInfo_;
    }

    function UpdateLiquidationPremuim(
        address token_,
        uint256 liquidationPremuim_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(collateralInfo_.isActivated, "securd: LP token is not listed");
        collateralInfos[token_].liquidationPremuim = liquidationPremuim_;
    }

    function UpdateTokenState(
        address token_,
        bool state_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        CollateralInfo memory collateralInfo_ = collateralInfos[token_];
        require(collateralInfo_.isActivated != state_, "securd: no change");
        collateralInfos[token_].isActivated = state_;
    }

    function getLeverageFactor(
        address borrower_,
        address token_
    ) external view returns (uint256) {
        (, , uint256 totalLoan_) = getLoanValue(borrower_, token_);
        if (totalLoan_ == 0) {
            return DECIMAL_FACTOR;
        } else {
            uint256 collateralFactor_ = getCollateralFactor(borrower_, token_);
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

  
    function getAmounts(address token_, uint256 amount_) public view
        returns (uint256 amount0_, uint256 amount1_){
        (amount0_, amount1_) = collateralPriceOracle.getCollateralAmount(token_, amount_);
    }


    function _convertAsset(address token_, address asset_) internal view returns (address){
            if (asset_ == address(0)){
                return  collateralInfos[token_].tokenInfo.wETH;
            } else {
                return asset_ ;
            }
    }


}
