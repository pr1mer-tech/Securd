import Help from "@/components/ui/Help";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FarmingAPY from "./FarmingAPY";
import AccountBalance from "./AccountBalance";
import Actions from "./Actions";
import Impact from "@/components/layout/Impact";

export default function InfoAddressCard() {
    return <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-row gap-4 mt-8">
            <div className="flex flex-col gap-4 w-full">
                <Card className="p-4">
                    <h2 className="text-2xl font-bold text-primary">
                        Farming APY
                        <Help>
                            Current yield of the position (Collateral - Loan) for this account
                        </Help>
                    </h2>
                    <Separator className="mt-2" />
                    <FarmingAPY />
                </Card>
                <Card className="p-4">
                    <h2 className="text-2xl font-bold text-primary">
                        Account Balance
                        <Help>
                            Net Farming value (Collateral - Loan) for this account
                        </Help>
                    </h2>
                    <Separator className="mt-2" />
                    <AccountBalance />
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