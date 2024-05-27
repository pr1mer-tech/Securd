"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
		thumbs?: React.ReactNode[];
		rangeClassName?: string;
	}
>(({ className, children, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex w-full touch-none select-none items-center h-5",
			className,
		)}
		{...props}
	>
		<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
			<SliderPrimitive.Range
				className={cn("absolute h-full bg-primary", props.rangeClassName)}
			/>
		</SliderPrimitive.Track>
		<div className="absolute left-0 w-full h-5 pointer-events-none flex flex-row z-0">
			{children}
		</div>
		{props.value?.map((value, index) => (
			<SliderPrimitive.Thumb
				key={index}
				className="block h-5 w-5 rounded-full border-2 border-primary bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-0"
			>
				{props.thumbs?.[index]}
			</SliderPrimitive.Thumb>
		))}
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
