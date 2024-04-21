export default function MrmScore({ score }: { score: number }) {
    return <>
        {!score && "N/A"}
        {score === 1 && "AAA"}
        {score === 2 && "AA"}
        {score === 3 && "A"}
        {score === 4 && "BBB"}
        {score === 5 && "BB"}
        {score === 6 && "B"}
        {score === 7 && "CCC"}
    </>
}