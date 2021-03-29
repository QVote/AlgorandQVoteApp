import { useEffect, useState, useRef } from 'react';

//I dont like this where are the types!!
declare global {
    interface Window { zilPay: any; }
}

if (typeof window != 'undefined') {
    window.zilPay = window.zilPay || undefined;
}

const zilPayEnabled = () => {
	if (typeof window != 'undefined' && (window.zilPay)) {
		return true; 
	}
	return false; 
}

export const useZilPay= () => {
    const [thereIsAProvider, setThereIsAProvider] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(true);
    const zil = useRef(null);

    useEffect(() => {
        if (zilPayEnabled()) {
            setThereIsAProvider(true);
            zil.current = window.zilPay!!;
        } else {
            setThereIsAProvider(false);
        }
        setLoadingProvider(false);
    }, [])
    return { thereIsAProvider, loadingProvider, zil }
}
