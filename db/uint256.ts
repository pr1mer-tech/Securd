import { customType } from 'drizzle-orm/pg-core';

export const uint256 = customType<{ data: bigint; notNull: true; default: true }>(
    {
        dataType() {
            return 'numeric(78, 0)';
        },
        fromDriver(value: unknown) {
            if (typeof value === 'string') {
                return BigInt(value.split('.')[0]);
            }
            if (typeof value === 'number') {
                return BigInt(Math.round(value));
            }
            if (typeof value === 'bigint') {
                return value;
            }
            return 0n;
        },
        toDriver(value: bigint) {
            return value.toString();
        },
    },
);