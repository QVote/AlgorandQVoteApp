import { MutableRefObject, useEffect, useState } from 'react';
import _config from "../config";

interface ProviderRpcError extends Error {
    message: string;
    code: number;
    data?: unknown;
}

export const useWallet = ({ eth }:
    {
        eth: MutableRefObject<any>,
    }) => {
    const targetChainId = _config.CHAIN_ID;
    const targetNetworkName = _config.NETWORK_NAME;
    const [walletLoading, setWalletLoading] = useState(false);
    // We say wallet is "connected" if 
    // there is a connected account to it
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    // any error thrown is here
    const [walletErrTxt, setWalletErrTxt] = useState("");
    // connected accounts
    const [accounts, setAccounts] = useState<string[]>([]);
    const [walletErrorCode, setErrorCode] = useState(_config.ERRORS.WRONG_CHAIN);

    useEffect(() => {
        eth.current.on('connect', onChainChanged);
        eth.current.on('chainChanged', onChainChanged);
        eth.current.on('disconnect', onDisconnect);
        eth.current.on('accountsChanged', onAccounts);
        connectAccounts();
    }, [])

    function areAccounts(accArr?: any) {
        let a = accArr ? accArr : accounts;
        if (a && Array.isArray(a)) {
            return a.length > 0;
        } else {
            return false;
        }
    }

    function onAccounts(accs: string[]) {
        setAccounts(accs);
        const areAccs = areAccounts(accs)
        setIsWalletConnected(areAccs)
        if (!areAccs) {
            setWalletErrTxt(`Please connect an account.`)
        }
        setWalletLoading(false);
    }

    function onDisconnect(e: ProviderRpcError) {
        setWalletErrTxt(e.message);
        setWalletLoading(false);
    }

    function onChainChanged(chainId?: string) {
        const decChainId = parseInt(chainId ? chainId : "-1").toString();
        if (decChainId == targetChainId) {
            setWalletErrTxt("");
            setErrorCode("");
        } else {
            setWalletErrTxt(`Invalid Chain ID, please use ${targetNetworkName}`);
            setErrorCode(_config.ERRORS.WRONG_CHAIN);
        }
        setWalletLoading(false);
    }

    async function connectAccounts() {
        if (!isWalletConnected && !walletLoading) {
            try {
                setWalletErrTxt("");
                setWalletLoading(true);
                const res = await eth.current
                    .request({ method: 'eth_requestAccounts' });
                const chainId = await eth.current
                    .request({ method: 'eth_chainId' });
                onAccounts(res);
                onChainChanged(chainId);
            } catch (e) {
                setWalletLoading(false);
                if (e.code === 4001) {
                    setWalletErrTxt("User rejected the request.")
                } else {
                    setWalletErrTxt(e.message);
                    setWalletLoading(true);
                    setTimeout((() => setWalletLoading(false)), 1000);
                }
            }
        }
    }

    return { isWalletConnected, walletLoading, connectAccounts, walletErrTxt, accounts, walletErrorCode }
}