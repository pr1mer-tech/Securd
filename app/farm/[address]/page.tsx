import Link from "next/link";
import FarmAddressSync from "./FarmAddressSync";
import { ArrowLeft } from "lucide-react";
import FarmAddressTitle from "./FarmAddressTitle";
import InfoAddressCard from "@/components/farm/address/InfoAddressCard";
import { Address } from "viem";
import PoolDetails from "@/components/farm/address/PoolDetails";

export default function FarmAddress({ params }: { params: { address: Address } }) {
    return <FarmAddressSync address={params.address}>
        <Link href="/farm" className="absolute left-5 top-5 text-white text-lg flex flex-row gap-2 items-center font-poppins hover:scale-110">
            <ArrowLeft className="w-6 h-6" />
            Back
        </Link>
        <div className="max-w-7xl mx-auto pt-16 px-4">
            <div className="flex flex-row justify-between">
                <h1 className="font-poppins text-4xl text-white">Farm</h1>
                <div className="flex flex-row items-center">
                    <FarmAddressTitle />
                </div>
            </div>
        </div>
        <div className="relative">
            <InfoAddressCard />
            <div className="absolute top-10 w-full h-full before:absolute before:inset-0 before:bg-securdPrimaryLight  before:w-full z-[-1] pb-4 before:h-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 my-16">
            <PoolDetails />
        </div>
    </FarmAddressSync>
}