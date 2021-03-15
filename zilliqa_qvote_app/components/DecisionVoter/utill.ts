function getVotesFromCredits(c: number) {
    const sqr = Math.round((Math.sqrt(Math.abs(c)) + Number.EPSILON) * 100) / 100;
    if (c < 0) {
        return -sqr;
    }
    return sqr;
}


//my codebase my rules
function intPls(sOrN: string | number): number {
    let resVal = 0;
    if (typeof sOrN == "string") {
        resVal = parseInt(sOrN)
    } else if (typeof sOrN == "number") {
        resVal = sOrN
    }
    return resVal;
}


export { getVotesFromCredits, intPls }