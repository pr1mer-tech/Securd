import Link from "next/link";
import SaveAddressSync from "./SaveAddressSync";
import { ArrowLeft } from "lucide-react";
import SaveAddressTitle from "./SaveAddressTitle";
import InfoAddressCard from "@/components/save/address/InfoAddressCard";
import type { Address } from "viem";
import PoolDetails from "@/components/save/address/PoolDetails";
import { db } from "@/db/db";
import { tokenToReserveInfo } from "@/lib/helpers/analytics.helper";

export default async function SaveAddress({ params, searchParams }: { params: { address: Address }; searchParams: { [key: string]: string | string[] | undefined } }) {
    const chain = typeof searchParams.chain === "string" ? searchParams.chain : "1"
    const token = await db.query.token.findFirst({
        where: (row, { eq }) => eq(row.token_address, params.address),
        with: {
            blockchain: true
        }
    });

    const reservesInfo = await tokenToReserveInfo(token, token?.blockchain);

    return <SaveAddressSync address={params.address} preReservesInfo={[reservesInfo]} chainId={chain}>
        <Link href="/save" className="absolute left-5 top-5 text-white text-lg flex flex-row gap-2 items-center font-poppins hover:scale-110">
            <ArrowLeft className="w-6 h-6" />
            Back
        </Link>
        <div className="max-w-7xl mx-auto pt-16 px-4">
            <div className="flex flex-row justify-between">
                <h1 className="font-poppins text-4xl text-white">Save</h1>
                <div className="flex flex-row items-center">
                    <SaveAddressTitle />
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
    </SaveAddressSync>
}