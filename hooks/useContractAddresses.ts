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

const curContractInit: QVote.ContractDecisionProcessed = {
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

export const useContractAddresses = (
  blockchainInfo: BlockchainInfo,
  connected: boolean
) => {
  const [cookieState, setCookieState] = useState<ContractAddressesCookie>(init);
  const [
    currentContract,
    setCurrentContract,
  ] = useState<QVote.ContractDecisionProcessed>(curContractInit);
  const router = useRouter();
  //it toggles when the cur contract is updated
  const [change, setChange] = useState(false);
  /**
   * If the contract changes toggle change
   */
  useEffect(() => {
    setChange(!change);
  }, [currentContract._this_address]);

  /**
   * Check query
   * if is address make it first in addresses
   * if it is not address do nothing
   */
  useEffect(() => {
    const { address } = router.query;
    const add = formatAddress(notArrPlz(address));
    if (validation.isAddress(add)) {
      console.log("making first", add);
      makeFirst(add);
    }
  }, [router.query]);

  function makeFirst(toMakeFirst: string) {
    const cur = getCookie().addresses;
    if (!cur.includes(toMakeFirst)) {
      const next = [toMakeFirst, ...cur];
      setCookie({ addresses: next });
    } else {
      const tail = cur.filter((a) => a != toMakeFirst);
      const next = [toMakeFirst, ...tail];
      setCookie({ addresses: next });
    }
  }

  function pushAddress(add: string) {
    const addresses = getCookie().addresses;
    const isAlreadyIn = addresses.filter((a) => add == a).length == 1;
    if (isAlreadyIn) {
      return;
    }
    //hold only most recent 8 contract addresses
    if (addresses.length > 7) {
      addresses.pop();
    }
    const next = [add, ...addresses];
    setCookie({ addresses: next });
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

  async function getCurrentContract() {
    const curAddress = cookieState.addresses[0];
    try {
      const blockchainApi = new BlockchainApi({
        wallet: "zilPay",
        protocol: blockchainInfo.protocol,
      });
      const state = await blockchainApi.getContractState(curAddress);
      setCurrentContract(state);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * If connected get the current first chosen contract state
   */
  useEffect(() => {
    if (connected && cookieState.addresses.length > 0) {
      getCurrentContract();
    }
  }, [connected, cookieState.addresses]);

  /**
   * Change cookies when network changes
   */
  useEffect(() => {
    onChange();
  }, [blockchainInfo.name]);

  return { ...cookieState, pushAddress, makeFirst, currentContract, change };
};
