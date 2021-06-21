import { QVote } from "../types";

export const infoInit: QVote.ContractInfo = {
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
