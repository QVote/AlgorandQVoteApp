import { useEffect, useState, useRef } from 'react';

//I dont like this where are the types!!
declare global {
    interface Window { ethereum: any; }
}

if (typeof window != 'undefined') {
    window.ethereum = window.ethereum || undefined;
}

const ethEnabled = () => {
    if (typeof window != 'undefined' && (window.ethereum)) {
        return true;
    }
    return false;
}

export const useEth = () => {
    const [thereIsAProvider, setThereIsAProvider] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(true);
    const eth = useRef(null);
    useEffect(() => {
        if (ethEnabled()) {
            setThereIsAProvider(true);
            eth.current = window.ethereum!!;
        } else {
            setThereIsAProvider(false);
        }
        setLoadingProvider(false);
    }, [])
    return { thereIsAProvider, loadingProvider, eth }
}