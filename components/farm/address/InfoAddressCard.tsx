"use client";

import Help from "@/components/ui/Help";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FarmingAPY from "./FarmingAPY";
import AccountBalance from "./AccountBalance";
import Actions from "./Actions";
import Impact from "@/components/layout/Impact";
import PercentageFormat from "@/components/utils/PercentageFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import SecurdFormat from "@/components/utils/SecurdFormat";
import CollateralFactor from "./CollateralFactor";

export default function InfoAddressCard() {
    const { totalApy, accountBalance, collateralFactor } = useFarmAddressStore((state) => ({
        totalApy: state.totalApy(),
        accountBalance: state.accountBalance(),
        collateralFactor: state.collateralFactor()
    }));

    return <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-row gap-4 mt-8">
            <div className="flex flex-col gap-4 w-full">
                <Card className="p-4">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-bold text-primary">
                            Farming APY
                            <Help>
                                Current yield of the position (Collateral - Loan) for this account
                            </Help>
                        </h2>
                        <PercentageFormat value={totalApy} className="font-bold text-2xl" />
                    </div>
                    <Separator className="mt-2" />
                    <FarmingAPY />
                </Card>
                <Card className="p-4">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-bold text-primary">
                            Account Balance
                            <Help>
                                Net Farming value (Collateral - Loan) for this account
                            </Help>
                        </h2>
                        <SecurdFormat value={accountBalance} className="font-bold text-2xl" prefix="$" />
                    </div>
                    <Separator className="mt-2" />
                    <AccountBalance />
                </Card>
                <Card className="p-4">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-bold text-primary">
                            Collateral Factor
                            <Help>
                                Collateral value divided by Loan value
                            </Help>
                        </h2>
                        <PercentageFormat factor value={collateralFactor} className="font-bold text-2xl" />
                    </div>
                    <Separator className="mt-2" />
                    <CollateralFactor />
                </Card>
            </div>
            <Card className="p-4 w-full">
                <h2 className="text-2xl font-bold text-primary">Actions</h2>
                <Separator className="mt-2" />
                <Actions />
            </Card>
        </div>
        <Impact />
    </div>
}