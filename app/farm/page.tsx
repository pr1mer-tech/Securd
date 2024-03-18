import AllAccounts from "@/components/farm/AllAccounts";
import Accounts from "@/components/farm/Accounts";
import InfoCard from "@/components/farm/InfoCard";
import FarmSync from "./FarmSync";

export const metadata = {
    title: "Secur·d - Farm",
    description: "Farm your assets and earn interest on your crypto."
}

export default function Farm() {
    return <FarmSync>
        <div className="max-w-7xl mx-auto pt-8 px-4">
            <h1 className="font-poppins text-4xl text-white">Farm</h1>
            <InfoCard />
        </div>
        <Accounts />
        <div className="max-w-7xl mx-auto px-4">
            <AllAccounts />
        </div>
    </FarmSync>
}