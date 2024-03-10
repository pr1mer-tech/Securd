import Accounts from "@/components/save/Accounts";
import InfoCard from "@/components/save/InfoCard";
import SaveSync from "./SaveSync";

export default function Save() {
    return <div className="relative">
        <div className="absolute inset-0 z-[-1]">
            <div className="bg-primary w-full h-44" />
            <div className="bg-securdPrimaryLight w-full" style={{
                height: "calc(80vh - 300px)",
            }} />
        </div>
        <div className="max-w-6xl mx-auto pt-8">
            <h1 className="font-poppins text-4xl text-white">Save</h1>
            <SaveSync>
                <InfoCard />
                <Accounts />
            </SaveSync>
        </div>
    </div>;
}