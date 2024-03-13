import React from "react";
import Image from "next/image";
import SecurdLogo from "@/assets/logos/securd-logo.svg";

const loading = () => {
    return (
        <div className="w-full bg-[#214a48] flex items-center justify-center" style={{ height: "calc(100vh - 70px)" }}>
            <Image priority={true} alt="securd logo" src={SecurdLogo} />
        </div>
    );
};

export default loading;
