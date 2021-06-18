import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../helpers/Zilliqa";
import type { QVote } from "../types";
import { BlockchainApi } from "../helpers/BlockchainApi";
import { useRouter } from "next/router";
import { formatAddress, notArrPlz } from "../scripts";
import { validation } from "@zilliqa-js/zilliqa";

type ContractAddressesCookie = { addresses: string[] };

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

type ContractInfo = {
    time: ContractTimeInfo;
    timeState: ContractTimeStates;
    userIsOwner: boolean;
    userVoter: UserVoterStates;
};

const init: ContractAddressesCookie = {
    addresses: [],
};

const infoInit: ContractInfo = {
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

const contractInit: QVote.ContractDecisionProcessed = {
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

export const useContracts = (
    blockchainInfo: BlockchainInfo,
    connected: boolean,
    userAccount: string
) => {
    const [cookieState, setCookieState] = useState<ContractAddressesCookie>(
        init
    );
    const [
        currentContract,
        setCurrentContract,
    ] = useState<QVote.ContractDecisionProcessed>(contractInit);
    const router = useRouter();
    const [currentInfo, setCurrentInfo] = useState<ContractInfo>(infoInit);
    const [message, setMessage] = useState("def");
    const [loading, setLoading] = useState(true);

    /**
     * Check query
     * if is address make it first in addresses
     * if it is not address do nothing
     */
    useEffect(() => {
        const { address } = router.query;
        const add = formatAddress(notArrPlz(address));
        if (validation.isAddress(add)) {
            onGetContract(add);
        } else {
            if (add != "") setMessage("Not an address!");
        }
    }, [router.query, userAccount]);

    async function onGetContract(add: string) {
        try {
            setLoading(true);
            await getContract(add);
            makeFirst(add);
            setMessage("");
        } catch (e) {
            console.error(e);
            if (e.message) {
                setMessage(e.message);
            }
        }
        setLoading(false);
    }

    function makeFirst(toMakeFirstIn: string) {
        const toMakeFirst = formatAddress(toMakeFirstIn);
        const cur = getCookie().addresses;
        if (!cur.includes(toMakeFirst)) {
            //hold only most recent 9 contract addresses
            if (cur.length > 8) {
                cur.pop();
            }
            const next = [toMakeFirst, ...cur];
            setCookie({ addresses: next });
        }
    }

    function getCookieName() {
        const baseName = "ZilliqaQvoteContractAddresses-";
        return baseName + blockchainInfo.name;
    }

    function setCookie(val: ContractAddressesCookie) {
        Cookie.set(getCookieName(), val, { path: "/" });
        setCookieState(val);
    }

    function getCookie(): ContractAddressesCookie {
        return Cookie.getJSON(getCookieName()) || init;
    }

    function onChange() {
        setCookie(getCookie());
    }

    /**
     * Get:
     * - current contract state
     * - current tx block rate
     * - current block number
     */
    async function getContract(curAddress: string) {
        const blockchainApi = new BlockchainApi({
            wallet: "zilPay",
            protocol: blockchainInfo.protocol,
        });
        const state = await blockchainApi.getContractState(curAddress);
        const curBlockNumber = await BlockchainApi.getCurrentBlockNumber();
        const rate = await BlockchainApi.getCurrentTxBlockRate();
        setCurrentContract(state);
        setCurrentInfo(
            updateCurrentContractStateMessages(
                state,
                rate,
                curBlockNumber,
                userAccount
            )
        );
    }

    /**
     * So this will update all of the messages
     * and state that is relevant to current user and contract
     */
    function updateCurrentContractStateMessages(
        c: QVote.ContractDecisionProcessed,
        rate: number,
        block: number,
        uAddress: string
    ): ContractInfo {
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

    /**
     * Change cookies when network changes
     */
    useEffect(() => {
        onChange();
    }, [blockchainInfo.name]);

    return {
        ...cookieState,
        loading,
        makeFirst,
        zeroState: () => {
            setCurrentContract(contractInit);
            setCurrentInfo(infoInit);
            setLoading(true);
        },
        message,
        contract: {
            state: currentContract,
            isDefined: currentContract._this_address != "",
            info: currentInfo,
        },
    };
};
