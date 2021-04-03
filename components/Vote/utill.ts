import { QVote } from "../../types";

function getVotesFromCredits(c: number) {
    const sqr = Math.round((Math.sqrt(Math.abs(c)) + Number.EPSILON) * 100) / 100;
    if (c < 0) {
        return -sqr;
    }
    return sqr;
}

type onSliderConfirm = (name:string, newVal:number,) => void;

function createSlidersState(decision: QVote.ContractDecision, userCredits: number): QVote.CreditDist {
    const sliderDS: QVote.CreditDist = {
        creditsRemaining: 0, options: []
    };

    sliderDS.creditsRemaining = userCredits;
    sliderDS.options = decision.options.map(o => ({
        name: o,
        max: sliderDS.creditsRemaining,
        min: 0,
        cur: 0,
    }));
    return sliderDS;
}

export type { onSliderConfirm };
export { getVotesFromCredits, createSlidersState };