import InfoCard from "@/components/analytics/InfoCard";

export const metadata = {
    title: "Secur·d - Analytics",
    description: "Analyze assets and track their progress."
}

export default function Analytics() {
    return <div className="max-w-7xl mx-auto pt-8 px-4">
        <h1 className="font-poppins text-4xl text-white">Analytics</h1>
        <InfoCard />
    </div>
}