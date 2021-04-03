import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";
import { QVoteZilliqa } from "@qvote/zilliqa-sdk";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import type { QVote } from "../types";

type ContractAddressesCookie = { addresses: string[] };

const init: ContractAddressesCookie = {
  addresses: [],
};

export const useContractAddresses = (
  blockchainInfo: BlockchainInfo,
  connected: boolean
) => {
  const [cookieState, setCookieState] = useState<ContractAddressesCookie>(init);
  const [
    currentContract,
    setCurrentContract,
  ] = useState<QVote.ContractDecision>({
    credit_to_token_ratio: "",
    description: "",
    expiration_block: "",
    name: "",
    options: [],
    options_to_votes_map: {},
    owner: "",
    registered_voters: [],
    registration_end_time: "",
    token_id: "",
    voter_balances: {},
    _balance: "",
    _creation_block: "",
    _scilla_version: "",
    _this_address: "",
  });

  function makeFirst(toMakeFirst: string) {
    const cur = getCookie().addresses;
    if (!cur.includes(toMakeFirst)) {
      return;
    } else {
      const tail = cur.filter((a) => a != toMakeFirst);
      const next = [toMakeFirst, ...tail];
      setCookie({ addresses: next });
    }
  }

  function pushAddress(add: string) {
    const next = [add, ...getCookie().addresses];
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
      const qv = new QVoteZilliqa(
        new Zilliqa("", window.zilPay.provider),
        blockchainInfo.protocol
      );
      const state = await qv.getContractState(curAddress);
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

  return { ...cookieState, pushAddress, makeFirst, currentContract };
};
