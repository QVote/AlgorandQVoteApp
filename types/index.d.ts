export module QVote {
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
}

export { ZilPay } from "./ZilPay";
