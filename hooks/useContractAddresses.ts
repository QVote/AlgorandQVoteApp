import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import type { BlockchainInfo } from "../config";

type ContractAddressesCookie = { addresses: string[] };

const init: ContractAddressesCookie = {
  addresses: [],
};

export const useContractAddresses = (blockchainInfo: BlockchainInfo) => {
  const [cookieState, setCookieState] = useState<ContractAddressesCookie>(init);

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

  useEffect(() => {
    onChange();
  }, [blockchainInfo.name]);

  return { ...cookieState, pushAddress, makeFirst };
};
