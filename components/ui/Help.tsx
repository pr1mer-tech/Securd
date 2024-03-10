import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import Image from "next/image";
import QuestionMark from "@/assets/icons/question-mark.svg";
import React from "react";

const Help = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Image src={QuestionMark} alt="question mark" className={cn("inline w-4 h-4 -mt-1 ml-1", className)} />
        </TooltipTrigger>
        <TooltipContent {...props} ref={ref}>
            <p>{children}</p>
        </TooltipContent>
    </Tooltip>
));

Help.displayName = "Help";

export default Help;