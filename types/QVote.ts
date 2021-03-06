export namespace QVote {
    export type Option = {
        optName: string;
        uid: string;
    };

    export type SliderState = {
        max: number;
        min: number;
        cur: number | string;
        optName: string;
        uid: string;
    };

    export type VotingDecision = {
        name: string;
        creditsRemaining: number;
        description: string;
        options: SliderState[];
    };

    export type Decision = {
        name: string;
        description: string;
        options: Option[];
        registerEndTime: number;
        endTime: number;
        creditToTokenRatio: string;
        tokenId: string;
    };

    export type Queue = {
        _balance: string;
        queue: string[];
        _this_address: string;
    };

    export type ResultOption = {
        optName: string;
        votes: number;
    };

    export type ResultDecision = {
        name: string;
        description: string;
        options: ResultOption[];
    };

    export type ContractDecision = {
        credit_to_token_ratio: string;
        description: string;
        expiration_block: string;
        name: string;
        options: string[];
        options_to_votes_map: { [key: string]: number };
        owner: string;
        registered_voters: string[];
        registration_end_time: string;
        token_id: string;
        voter_balances: { [key: string]: string };
        _balance: string;
        _creation_block: string;
        _scilla_version: string;
        _this_address: string;
    };

    export type ContractDecisionProcessed = {
        credit_to_token_ratio: string;
        description: string;
        expiration_block: number;
        name: string;
        options: string[];
        options_to_votes_map: { [key: string]: number };
        option_to_votes: { name: string; vote: number }[];
        owner: string;
        registered_voters: string[];
        registration_end_time: number;
        token_id: string;
        voter_balances: { [key: string]: number };
        _this_address: string;
    };

    export type SliderDs = {
        max: number;
        min: number;
        cur: number;
        name: string;
    };
    export type CreditDist = {
        creditsRemaining: number;
        options: SliderDs[];
    };

    type UserVoterStates =
        | "REGISTERED_NOT_VOTED"
        | "REGISTERED_VOTED"
        | "NOT_REGISTERED";

    type ContractTimeStates =
        | "REGISTRATION_IN_PROGRESS"
        | "VOTING_IN_PROGRESS"
        | "VOTING_ENDED";

    type ContractTimeInfo = {
        registrationEnds: { blocks: number; minutes: number };
        voteEnds: { blocks: number; minutes: number };
    };
    export type ContractInfo = {
        time: ContractTimeInfo;
        timeState: ContractTimeStates;
        userIsOwner: boolean;
        userVoter: UserVoterStates;
    };
}
