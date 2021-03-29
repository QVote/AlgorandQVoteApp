import React, { MutableRefObject } from "react";

const init: {
    eth: MutableRefObject<any> | undefined,
    accounts: string[],
    qvoteAddress: string,
    isAddress: boolean,
    isQVContract: boolean,
    setQvoteAddress: (arg: string) => any
} = {
    eth: undefined,
    accounts: [],
    qvoteAddress: "",
    isAddress: false,
    isQVContract: false,
    setQvoteAddress: x => x
}

export const GlobalContext = React.createContext(init);
