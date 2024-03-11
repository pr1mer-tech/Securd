import Link from "next/link";
import SaveAddressSync from "./SaveAddressSync";
import { ArrowLeft } from "lucide-react";
import SaveAddressTitle from "./SaveAddressTitle";

export default function SaveAddress({ params }: { params: { address: string } }) {
    return <SaveAddressSync address={params.address}>
        <Link href="/save" className="absolute left-5 top-10 text-white text-lg flex flex-row gap-2 items-center font-poppins hover:scale-110">
            <ArrowLeft className="w-6 h-6" />
            Back
        </Link>
        <div className="max-w-7xl mx-auto pt-8 px-4 flex flex-row justify-between">
            <h1 className="font-poppins text-4xl text-white">Save</h1>
            <div className="flex flex-row items-center">
                <SaveAddressTitle />
            </div>
        </div>
    </SaveAddressSync>
}