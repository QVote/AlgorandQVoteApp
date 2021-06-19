import { QVote } from "../../types";

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

export const infoInit: ContractInfo = {
    time: {
        registrationEnds: {
            blocks: 0,
            minutes: 0,
        },
        voteEnds: {
            blocks: 0,
            minutes: 0,
        },
    },
    timeState: "REGISTRATION_IN_PROGRESS",
    userIsOwner: false,
    userVoter: "NOT_REGISTERED",
};

export const contractInit: QVote.ContractDecisionProcessed = {
    credit_to_token_ratio: "",
    description: "",
    expiration_block: -1,
    name: "",
    options: [],
    options_to_votes_map: {},
    option_to_votes: [],
    owner: "",
    registered_voters: [],
    registration_end_time: -1,
    token_id: "",
    voter_balances: {},
    _balance: "",
    _creation_block: "",
    _scilla_version: "",
    _this_address: "",
};
