import { QVote } from "../../types";

/**
 * So this will update all of the messages
 * and state that is relevant to current user and contract
 */
export function getContractStateMessages(
    c: QVote.ContractDecisionProcessed,
    rate: number,
    block: number,
    uAddress: string
): QVote.ContractInfo {
    const registrationEndBlocks = c.registration_end_time - block;
    const voteEndsInBlocks = c.expiration_block - block;
    return {
        time: {
            registrationEnds: {
                blocks: registrationEndBlocks,
                minutes: Math.round(registrationEndBlocks / rate / 60),
            },
            voteEnds: {
                blocks: voteEndsInBlocks,
                minutes: Math.round(voteEndsInBlocks / rate / 60),
            },
        },
        timeState:
            registrationEndBlocks > 0
                ? "REGISTRATION_IN_PROGRESS"
                : voteEndsInBlocks > 0
                ? "VOTING_IN_PROGRESS"
                : "VOTING_ENDED",
        userIsOwner: c.owner == uAddress,
        userVoter: Object.keys(c.voter_balances).includes(uAddress)
            ? c.voter_balances[uAddress] == 0
                ? "REGISTERED_VOTED"
                : "REGISTERED_NOT_VOTED"
            : "NOT_REGISTERED",
    };
}
