import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LockIconPrimary from "@/assets/icons/lock-icon-primary";
import BorrowIconPrimary from "@/assets/icons/borrow-icon-primary";
import LeverageIconPrimary from "@/assets/icons/leverage-icon-primary";
import Collateral from "./actions/Collateral";
import Loan from "./actions/Loan";
import Leverage from "./actions/Leverage";
export default function Actions() {
    return <Tabs defaultValue="collateral" className="mt-2">
        <TabsList className="bg-transparent w-full h-full gap-4">
            <TabsTrigger
                value="collateral"
                className="w-full h-28 rounded-md text-primary flex flex-col gap-1 border-2 border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
            >
                <LockIconPrimary className="block w-6 h-6" />
                Collateral
            </TabsTrigger>
            <TabsTrigger
                value="leverage"
                className="w-full h-28 rounded-md text-primary flex flex-col gap-1 border-2 border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
            >
                <LeverageIconPrimary className="block w-6 h-6" />
                Leverage
            </TabsTrigger>
            <TabsTrigger
                value="loan"
                className="w-full h-28 rounded-md text-primary flex flex-col gap-1 border-2 border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
            >
                <BorrowIconPrimary className="block w-6 h-6" />
                Loan
            </TabsTrigger>
        </TabsList>
        <TabsContent value="collateral" className="mt-4">
            <Collateral />
        </TabsContent>
        <TabsContent value="leverage" className="mt-4">
            <Leverage />
        </TabsContent>
        <TabsContent value="loan" className="mt-4">
            <Loan />
        </TabsContent>
    </Tabs>
}