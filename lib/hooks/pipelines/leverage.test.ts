import { collateralPoolContract, borrowerDataContract } from '@/lib/constants/wagmiConfig/wagmiConfig';
import { bigIntToDecimal } from '@/lib/helpers/main.helpers';
import { describe, it, expect } from 'bun:test';
import { createWalletClient, getContract, http, publicActions } from 'viem';
import { cronosTestnet } from 'viem/chains';

BigInt.prototype.toJSON = function () {
	return this.toString();
};

const leverageToLp = (
	_leverageFactor: number,
	collateralAmount: bigint,
): bigint | undefined => {
	// Leverage is calculated as collateralFactor / (collateralFactor - 1)
	const unit = BigInt(10) ** BigInt(18);
	const leverageFactor = BigInt(Math.round(_leverageFactor * 1000)) * unit / 1000n - unit;
	return leverageFactor * collateralAmount / unit;
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

		const [collateralAmount, tokenA, tokenB] = await collateralPool.read.borrowerBalances([borrower, token]);

		expect(currentLeverage).toBeLessThan(maxLeverage);

		const targetLeverage = (_maxLeverage - _currentLeverage) / 2 + _currentLeverage; // Point at the midpoint

		console.log(`Current leverage: ${_currentLeverage}, max leverage: ${_maxLeverage}, target leverage: ${targetLeverage}`);

		// Calculate the transaction amount
		const transactionAmount = leverageToLp(targetLeverage, collateralAmount ?? 0n);

		console.log(`Transaction amount: ${transactionAmount}`);

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