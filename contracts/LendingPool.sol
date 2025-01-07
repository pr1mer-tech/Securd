// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./libraries/AssetTransfer.sol";
import "./Token.sol";
import "./DDeployer.sol";
import "./LDeployer.sol";
import "./InterestRate.sol";
import "./TokenPrice.sol";

contract LendingPool is AccessControlEnumerable, Pausable {
    using Math for uint256;

    struct TokenInfo {
        uint256 dTokenPrice;
        uint256 lTokenPrice;
        address dToken;
        address lToken;
    }

    struct Fee {
        uint256 reserveFee;
        uint256 flashLoanFee;
    }

    struct InterestRateInfo {
        uint256 minValue;
        uint256 maxValue;
        uint256 optimalUtilizationRate;
        uint256 utilizationRate;
        uint256 interestRate;
    }

    struct ReserveInfo {
        uint256 supplyCap;
        uint256 supply;
        uint256 debt;
        Fee fee;
        uint256 lastBlock;
        uint256 lastTime;
        bool isActivated;
        InterestRateInfo interestRateInfo;
        TokenInfo tokenInfo;
    }

    address public treasury;
    DDeployer private dDeployer;
    LDeployer private lDeployer;
    InterestRate private interestRate;
    TokenPrice private tokenPrice;

    mapping(address => ReserveInfo) public reserveInfos;
    mapping(address => mapping(address => uint256)) private lenderSupply;
    mapping(address => mapping(address => bool)) private collateralTokens;
    mapping(address => bool) private collateralPools;

    event Supply(
        address indexed asset_,
        uint256 assetAmount_,
        uint256 dTokenAmount,
        address indexed to_
    );
    event Withdraw(
        address indexed asset_,
        uint256 assetAmount_,
        uint256 dTokenAmount_,
        address indexed to_
    );
    event UpdateModelParams(
        address indexed asset_,
        uint256 utilizationRate_,
        uint256 interestRate_
    );
    event AddAsset(
        address indexed asset_,
        address indexed dToken_,
        address indexed lToken_
    );
    event UpdateProtocoleFee(address indexed asset_, Fee fee_);
    event UpdateInterestRateParams(
        address indexed asset_,
        uint256 minValue_,
        uint256 maxValue_,
        uint256 optimalUtilizationRate_
    );
    event UpdateSupplyCap(address indexed asset_, uint256 supplyCap_);
    event UpdateCollateral(
        address indexed asset_,
        address indexed token_,
        bool state_
    );

    constructor(
        address admin_,
        address dDeployer_,
        address lDeployer_,
        address interestRate_,
        address tokenPrice_,
        address treasury_
    ) payable {
        require(admin_ != address(0), "Securd: zero address");
        require(dDeployer_ != address(0), "Securd: zero address");
        require(lDeployer_ != address(0), "Securd: zero address");
        require(interestRate_ != address(0), "Securd: zero address");
        require(tokenPrice_ != address(0), "Securd: zero address");
        require(treasury_ != address(0), "Securd: zero address");
        dDeployer = DDeployer(dDeployer_);
        lDeployer = LDeployer(lDeployer_);
        interestRate = InterestRate(interestRate_);
        tokenPrice = TokenPrice(tokenPrice_);
        treasury = treasury_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    }

    modifier updateParams(address asset_) {
        _updateModelParams(asset_);
        _;
    }

    receive() external payable {}

    function supply(
        address asset_,
        uint256 amount_,
        address to_
    ) external payable whenNotPaused updateParams(asset_) {
        _supply(asset_, amount_, to_);
    }

    function withdraw(
        address asset_,
        uint256 amount_,
        address to_
    ) external whenNotPaused updateParams(asset_) {
        uint256 dTokenPrice_ = reserveInfos[asset_].tokenInfo.dTokenPrice;
        require(dTokenPrice_ != 0, "secured: zero price");
        uint256 dTokenAmount_ = (amount_ * DECIMAL_FACTOR) / dTokenPrice_;
        _withdraw(asset_, dTokenAmount_, amount_, to_);
    }

    function updateModelParams(address asset_) external {
        _updateModelParams(asset_);
    }

    function _supply(address asset_, uint256 amount_, address to_) internal {
        require(amount_ != 0, "Securd: zero amount");
        require(to_ != address(0), "Securd: zero address");
        ReserveInfo memory reserveInfo_ = reserveInfos[asset_];

        require(reserveInfo_.isActivated, "Securd: asset is not listed");
        require(
            (reserveInfo_.supply + amount_) <= reserveInfo_.supplyCap,
            "Securd: supply cap limit"
        );
        uint256 dTokenAmount_ = (amount_ * DECIMAL_FACTOR) /
            reserveInfo_.tokenInfo.dTokenPrice;

        if (asset_ != address(0)) {
            AssetTransfer.transferFrom(
                msg.sender,
                address(this),
                amount_,
                IERC20(asset_)
            );
            require((msg.value == 0), "Securd: native token amount is not zero");
        } else {
            require((msg.value == amount_), "Securd: no required amount");
        }
        lenderSupply[to_][asset_] += amount_;
        reserveInfos[asset_].supply += amount_;
        address dToken_ = reserveInfo_.tokenInfo.dToken;
        DToken(dToken_).mint(to_, dTokenAmount_);
        emit Supply(asset_, amount_, dTokenAmount_, to_);
    }

    function _withdraw(
        address asset_,
        uint256 dTokenAmount_,
        uint256 assetAmount_,
        address to_
    ) internal whenNotPaused updateParams(asset_) {
        require(dTokenAmount_ != 0, "Securd: zero amount");
        require(assetAmount_ != 0, "Securd: zero amount");
        require(to_ != address(0), "Securd: zero address");
        ReserveInfo memory reserveInfo_ = reserveInfos[asset_];
        //require(reserveInfo_.isActivated, "Securd: asset is not listed");
        if (asset_ != address(0)) {
            require(
                assetAmount_ <= IERC20(asset_).balanceOf(address(this)),
                "Securd: not enough liquidity"
            );
        } else {
            require(
                assetAmount_ <= address(this).balance,
                "Securd: not enough liquidity"
            );
        }
        address dToken_ = reserveInfo_.tokenInfo.dToken;
        require(
            dTokenAmount_ <= IERC20(dToken_).balanceOf(msg.sender),
            "Securd: not enough balance"
        );

        DToken(dToken_).burn(msg.sender, dTokenAmount_);
        lenderSupply[msg.sender][asset_] -= Math.min(
            lenderSupply[msg.sender][asset_],
            assetAmount_
        );
        reserveInfos[asset_].supply -= Math.min(
            reserveInfos[asset_].supply,
            assetAmount_
        );
        AssetTransfer.transfer(to_, assetAmount_, asset_);
        emit Withdraw(asset_, assetAmount_, dTokenAmount_, msg.sender);
    }

    function _updateModelParams(address asset_) internal {
        ReserveInfo storage reserveInfo_ = reserveInfos[asset_];
        if (block.timestamp > reserveInfo_.lastTime) {
            TokenInfo storage tokenInfo_ = reserveInfo_.tokenInfo;
            uint256 supplyWithInterests_ = IERC20(tokenInfo_.dToken)
                .totalSupply() * tokenInfo_.dTokenPrice;
            uint256 debtWithInterests_ = IERC20(tokenInfo_.lToken)
                .totalSupply() * tokenInfo_.lTokenPrice;
            uint256 utilizationRate_;
            if (supplyWithInterests_ != 0) {
                utilizationRate_ =
                    (debtWithInterests_ * DECIMAL_FACTOR) /
                    supplyWithInterests_;
            }

            reserveInfo_.interestRateInfo.utilizationRate = utilizationRate_;
            uint256 interestRate_ = interestRate.CalculateInterestRate(
                reserveInfo_.interestRateInfo.minValue,
                reserveInfo_.interestRateInfo.maxValue,
                reserveInfo_.interestRateInfo.optimalUtilizationRate,
                utilizationRate_,
                reserveInfo_.interestRateInfo.interestRate
            );
            reserveInfo_.interestRateInfo.interestRate = interestRate_;
            uint256 netInterestRate_ = ((DECIMAL_FACTOR -
                reserveInfo_.fee.reserveFee) *
                utilizationRate_ *
                interestRate_) / (DECIMAL_FACTOR * DECIMAL_FACTOR);
            reserveInfo_.tokenInfo.dTokenPrice = tokenPrice.calculateTokenPrice(
                reserveInfo_.tokenInfo.dTokenPrice,
                reserveInfo_.lastTime,
                reserveInfo_.lastBlock,
                netInterestRate_
            );
            reserveInfo_.tokenInfo.lTokenPrice = tokenPrice.calculateTokenPrice(
                reserveInfo_.tokenInfo.lTokenPrice,
                reserveInfo_.lastTime,
                reserveInfo_.lastBlock,
                interestRate_
            );
            reserveInfo_.lastTime = block.timestamp;
            reserveInfo_.lastBlock = block.number;
            emit UpdateModelParams(asset_, utilizationRate_, interestRate_);
        }
    }

    function addAsset(
        address asset_,
        uint256 supplyCap_,
        Fee memory fee_,
        uint256 minValue_,
        uint256 maxValue_,
        uint256 initialInterestRate_,
        uint256 optimalUtilizationRate_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            !reserveInfos[asset_].isActivated,
            "Securd: asset is already listed"
        );
        reserveInfos[asset_].supplyCap = supplyCap_;
        reserveInfos[asset_].fee = fee_;
        reserveInfos[asset_].interestRateInfo.minValue = minValue_;
        reserveInfos[asset_].interestRateInfo.maxValue = maxValue_;
        reserveInfos[asset_]
            .interestRateInfo
            .optimalUtilizationRate = optimalUtilizationRate_;
        reserveInfos[asset_]
            .interestRateInfo
            .interestRate = initialInterestRate_;
        address dToken_ = dDeployer.deployDToken(address(this), asset_);
        reserveInfos[asset_].tokenInfo.dToken = dToken_;
        address lToken_ = lDeployer.deployLToken(address(this), asset_);
        reserveInfos[asset_].tokenInfo.lToken = lToken_;
        reserveInfos[asset_].tokenInfo.dTokenPrice = DECIMAL_FACTOR;
        reserveInfos[asset_].tokenInfo.lTokenPrice = DECIMAL_FACTOR;
        reserveInfos[asset_].lastTime = block.timestamp;
        reserveInfos[asset_].lastBlock = block.number;
        reserveInfos[asset_].isActivated = true;
        emit AddAsset(asset_, dToken_, lToken_);
    }

    //remove

    function updateFee(
        address asset_,
        
        Fee memory fee_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            reserveInfos[asset_].isActivated,
            "Securd: asset is not listed"
        );
        reserveInfos[asset_].fee = fee_;
        emit UpdateProtocoleFee(asset_, fee_);
    }

    function updateInterestRateParams(
        address asset_,
        uint256 minValue_,
        uint256 maxValue_,
        uint256 optimalUtilizationRate_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            reserveInfos[asset_].isActivated,
            "Securd: asset is not listed"
        );
        reserveInfos[asset_].interestRateInfo.minValue = minValue_;
        reserveInfos[asset_].interestRateInfo.maxValue = maxValue_;
        reserveInfos[asset_]
            .interestRateInfo
            .optimalUtilizationRate = optimalUtilizationRate_;
        emit UpdateInterestRateParams(
            asset_,
            minValue_,
            maxValue_,
            optimalUtilizationRate_
        );
    }

    function updateSupplyCap(
        address asset_,
        uint256 supplyCap_
        
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            reserveInfos[asset_].isActivated,
            "Securd: asset is not listed"
        );
        reserveInfos[asset_].supplyCap = supplyCap_;
        emit UpdateSupplyCap(asset_, supplyCap_);
    }

    function updateAssetState(
        address asset_,
        bool state_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            reserveInfos[asset_].isActivated != state_,
            "Securd: no change "
        );
        reserveInfos[asset_].isActivated = state_;
    }

    function updateCollateral(
        address asset_,
        address[] calldata tokens_,
        bool state_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address token_;
        for (uint256 i = 0; i < tokens_.length; i++) {
            token_ = tokens_[i];
            require(token_ != address(0), "Securd: zero address");
            collateralTokens[asset_][token_] = state_;
            emit UpdateCollateral(asset_, token_, state_);
        }
    }

    function updateCollateralPools(
        address collateralPool_,
        bool state_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(collateralPool_ != address(0), "Securd: zero address");
        collateralPools[collateralPool_] = state_;
    }

    function sendAsset(
        address token_,
        address asset_,
        uint256 amount_,
        address to_
    ) external  {
        require(to_ != address(0), "Securd: zero address");
        require(
            reserveInfos[asset_].isActivated,
            "Securd: asset is not listed"
        );
        require(collateralPools[msg.sender], "Securd: caller is not allowed");
        require(
            collateralTokens[asset_][token_],
            "Securd: token is not allowed"
        );

        if (asset_ != address(0)) {
            require(
                amount_ <= IERC20(asset_).balanceOf(address(this)),
                "Securd: not enough liquidity"
            );
        } else {
            require(
                amount_ <= address(this).balance,
                "Securd: not enough liquidity"
            );
        }
        //fee_ = (amount_ * reserveInfos[asset_].fee.loanFee) / DECIMAL_FACTOR;
       // amountToSend_ = amount_ - fee_;
       // AssetTransfer.transfer(treasury, fee_, asset_);
        AssetTransfer.transfer(to_, amount_, asset_);
    }

    function mintOrBurnLToken(
        address token_,
        address asset_,
        uint256 amountLToken_,
        uint256 amountAsset_,
        address to_,
        bool direction_
    ) external {
        require(to_ != address(0), "Securd: zero address");
        require(
            reserveInfos[asset_].isActivated,
            "Securd: asset is not listed"
        );
        require(collateralPools[msg.sender], "Securd: caller is not allowed");
        require(
            collateralTokens[asset_][token_],
            "Securd: token is not allowed"
        );
        require(amountLToken_ != 0, "Securd: zero amount");
        require(amountAsset_ != 0, "Securd: zero amount");
        address lToken_ = reserveInfos[asset_].tokenInfo.lToken;
        if (direction_) {
            LToken(lToken_).mint(to_, amountLToken_);
            reserveInfos[asset_].debt += amountAsset_;
        } else {
            LToken(lToken_).burn(to_, amountLToken_);
            reserveInfos[asset_].debt -= Math.min(
                reserveInfos[asset_].debt,
                amountAsset_
            );
        }
    }

    function getTokenPrice(
        address asset_
    ) external view returns (uint256 lTokenPrice_, uint256 dTokenPrice_) {
        ReserveInfo memory reserveInfo_ = reserveInfos[asset_];
        lTokenPrice_ = reserveInfo_.tokenInfo.lTokenPrice;
        dTokenPrice_ = reserveInfo_.tokenInfo.dTokenPrice;
    }

    function getLenderSupply(
        address asset_,
        address lender_
    ) external view returns (uint256) {
        return lenderSupply[lender_][asset_];
    }
}
