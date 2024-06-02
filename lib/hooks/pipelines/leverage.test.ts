import { collateralPoolContract, borrowerDataContract, collateralPriceContract } from '@/lib/constants/wagmiConfig/wagmiConfig';
import { bigIntToDecimal } from '@/lib/helpers/main.helpers';
import { describe, it, expect } from 'bun:test';
import { createWalletClient, getContract, http, publicActions } from 'viem';
import { cronosTestnet } from 'viem/chains';

BigInt.prototype.toJSON = function () {
	return this.toString();
};

describe('leverage', () => {
	const client = createWalletClient({
		chain: cronosTestnet,
		transport: http()
	}).extend(publicActions);

	const collateralPool = getContract({
		...collateralPoolContract,
		client,
	});

	const collateralPriceOracle = getContract({
		...collateralPriceContract,
		client,
	});

	const borrowerData = getContract({
		...borrowerDataContract,
		client,
	});

	it('should get correct position data', async () => {
		const borrower = "0x492804D7740150378BE8d4bBF8ce012C5497DeA9";
		const token = "0x3918B9bf24D714DE987514b2fBD034AAd3a5c089";

		const currentLeverage = await collateralPool.read.getLeverageFactor([borrower, token]);
		const _currentLeverage = bigIntToDecimal(currentLeverage, 18) ?? 0;

		const maxLeverage = await borrowerData.read.getMaxLevereage([borrower, token]);
		const _maxLeverage = bigIntToDecimal(maxLeverage, 18) ?? 0;

		const maxIncrease = await borrowerData.read.getMaxIncrease([borrower, token]);

		const [, tokenA, tokenB] = await collateralPool.read.borrowerBalances([borrower, token]);

		expect(currentLeverage).toBeLessThan(maxLeverage);

		const targetLeverage = (_maxLeverage - _currentLeverage) / 2 + _currentLeverage; // Point at the midpoint
		const _targetLeverage = BigInt(Math.round(targetLeverage * 1e9)) * 10n ** 9n;

		console.log(`Current leverage: ${_currentLeverage}, max leverage: ${_maxLeverage}, target leverage: ${targetLeverage}`);

		// Calculate the transaction Value
		const collateralValue = await collateralPool.read.getCollateralValue([borrower, token]);

		const [, , loanValue] = await collateralPool.read.getLoanValue([borrower, token]);

		const delta_colateral_value = _targetLeverage * (collateralValue - loanValue) / (10n ** 18n) - collateralValue;

		console.log(`Transaction value: ${delta_colateral_value}`);

		// Calculate the transaction amount
		const [, , lpPrice] = await collateralPriceOracle.read.getCollateralPrice([token]);

		const transactionAmount = (delta_colateral_value * (10n ** 18n)) / lpPrice;

		console.log(`Transaction amount: ${transactionAmount}`);

		if (transactionAmount > maxIncrease) {
			console.log(`Transaction amount is greater than max increase: ${maxIncrease}`);
			return;
		}

		// Verify using position data
		const positionData = await borrowerData.read.getPositionData([
			{
				token: token,
				borrower: borrower,
				amount: transactionAmount ?? 0n,
				amount0: tokenA,
				amount1: tokenB,
				direction: true,
				direction0: true,
				direction1: true,
			},
		]);

		console.log(`Position data: ${JSON.stringify(positionData)}`);

		expect(bigIntToDecimal(positionData.leverageFactor, 18)).toBeCloseTo(targetLeverage, 2);
	});
});