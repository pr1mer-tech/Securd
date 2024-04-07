export default function AnalyticsLayout({ children }: {
    children: React.ReactNode
}) {
    return <>
        <div className="fixed top-0 bg-securdPrimaryLight w-full min-h-screen h-full -z-10" />
        <div className="relative">
            <div className="absolute inset-0 z-[-1]">
                <div className="bg-primary w-full h-44" />
            </div>
            {children}
        </div>
    </>
}