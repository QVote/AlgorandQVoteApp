import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";
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
  const [cookieState, setCookieState] = useState<ContractAddressesCookie>(init);
  const [currentContract, setCurrentContract] = useState<QVote.Queue>(
    contractInit
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Check query
   * if it is not address do nothing
   */
  useEffect(() => {
    const { queueAddress } = router.query;
    const add = formatAddress(notArrPlz(queueAddress));
    if (validation.isAddress(add)) {
      if (currentContract._this_address != add) {
        getCurrentContract();
      }
    }
  }, [router.query]);

  function makeFirst(toMakeFirstIn: string) {
    const toMakeFirst = formatAddress(toMakeFirstIn);
    const cur = getCookie().addresses;
    if (cur.length > 0 && toMakeFirst == cur[0]) {
      //already first
      return;
    }
    if (!cur.includes(toMakeFirst)) {
      //hold only most recent 9 contract addresses
      if (cur.length > 8) {
        cur.pop();
      }
      const next = [toMakeFirst, ...cur];
      setCookie({ addresses: next });
    } else {
      const tail = cur.filter((a) => a != toMakeFirst);
      const next = [toMakeFirst, ...tail];
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

  /**
   * Get:
   * - current contract state
   * - current tx block rate
   * - current block number
   */
  async function getCurrentContract() {
    if (!loading) {
      setLoading(true);
      const curAddress = cookieState.addresses[0];
      try {
        const blockchainApi = new BlockchainApi({
          wallet: "zilPay",
          protocol: blockchainInfo.protocol,
        });
        const state = await blockchainApi.getQueueState(curAddress);
        setCurrentContract(state);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
  }

  /**
   * If connected get the current first chosen contract state
   * If the user account changes update the contract states too
   */
  useEffect(() => {
    if (connected && cookieState.addresses.length > 0) {
      getCurrentContract();
    }
  }, [connected, cookieState.addresses, userAccount]);

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
    contract: {
      state: currentContract,
      isDefined: currentContract._this_address != "",
    },
  };
};
