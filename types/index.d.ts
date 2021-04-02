export module QVote {
    export type Option = {
        optName: string,
        uid: string,
    }

    export type SliderState = {
        max: number,
        min: number,
        cur: number | string,
        optName: string,
        uid: string,
    }

    export type VotingDecision = {
        name: string,
        creditsRemaining: number,
        description: string,
        options: SliderState[],
    }

    export type Decision = {
        name: string,
        description: string,
        options: Option[],
        registerEndTime: number,
        endTime: number
        creditToTokenRatio: string,
        tokenId: string,
    }

    export type ResultOption = {
        optName: string,
        votes: number
    }

    export type ResultDecision = {
        name: string,
        description: string,
        options: ResultOption[],
    }
}
