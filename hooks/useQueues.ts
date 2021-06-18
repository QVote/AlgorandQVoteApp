import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../helpers/Zilliqa";
import type { QVote } from "../types";
import { BlockchainApi } from "../helpers/BlockchainApi";
import { useRouter } from "next/router";
import { formatAddress, notArrPlz } from "../scripts";
import { validation } from "@zilliqa-js/zilliqa";

type ContractAddressesCookie = { addresses: string[] };

const init: ContractAddressesCookie = {
    addresses: [],
};

const contractInit: QVote.Queue = {
    _balance: "",
    queue: [],
    _this_address: "",
};

export const useQueues = (
    blockchainInfo: BlockchainInfo,
    connected: boolean,
    userAccount: string
) => {
    const [cookieState, setCookieState] = useState<ContractAddressesCookie>(
        init
    );
    const [currentContract, setCurrentContract] = useState<QVote.Queue>(
        contractInit
    );
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("def");

    /**
     * Check query
     * if it is not address do nothing
     */
    useEffect(() => {
        const { queueAddress } = router.query;
        const add = formatAddress(notArrPlz(queueAddress));
        if (validation.isAddress(add)) {
            onGetContract(add);
        } else {
            if (add != "") setMessage("Not an address!");
        }
    }, [router.query]);

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
        const baseName = "ZilliqaQueueAddresses-";
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

    /**
     * Get:
     * - current contract state
     */
    async function getContract(curAddress: string) {
        const blockchainApi = new BlockchainApi({
            wallet: "zilPay",
            protocol: blockchainInfo.protocol,
        });
        const state = await blockchainApi.getQueueState(curAddress);
        setCurrentContract(state);
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
            setLoading(true);
        },
        message,
        contract: {
            state: currentContract,
            isDefined: currentContract._this_address != "",
        },
    };
};
