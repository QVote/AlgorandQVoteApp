import { useEffect } from "react";
import { useRouter } from "next/router";
import { zilliqaApi } from "../helpers/Zilliqa/ZilliqaApi";

export const useContracts = () => {
    const router = useRouter();
    /**
     * Check query
     * if it is not address do nothing
     */
    useEffect(() => {
        const { address } = router.query;
        zilliqaApi.tryToGetContract(address);
    }, [router.query, zilliqaApi.currentAddress]);
};
