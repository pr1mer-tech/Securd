import AllAccounts from "@/components/save/AllAccounts";
import Accounts from "@/components/save/Accounts";
import InfoCard from "@/components/save/InfoCard";
import SaveSync from "./SaveSync";

export const metadata = {
    title: "Secur·d - Save",
    description: "Save your assets and earn interest on your crypto."
}

export default function Save() {
    return <SaveSync>
        <div className="max-w-7xl mx-auto pt-8 px-4">
            <h1 className="font-poppins text-4xl text-white">Save</h1>
            <InfoCard />
        </div>
        <Accounts />
        <div className="max-w-7xl mx-auto px-4">
            <AllAccounts />
        </div>
    </SaveSync>
}