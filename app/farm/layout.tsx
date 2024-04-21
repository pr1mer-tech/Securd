export const revalidate = 3600 // revalidate at most every hour

export default function FarmLayout({ children }: {
    children: React.ReactNode
}) {
    return <div className="relative">
        <div className="absolute inset-0 z-[-1]">
            <div className="bg-primary w-full h-44" />
        </div>
        {children}
    </div>
}