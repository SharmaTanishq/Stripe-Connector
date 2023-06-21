export default (value: number) : number => {
    const totalCents = (value * 100 ).toFixed(0)
    return Number(totalCents)
}