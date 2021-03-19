import { ethers, Contract } from 'ethers'
import { useEffect, useState } from 'react'
import { QVBSC } from '../types';
import { abi } from '../config';
import { getNumberFromBigNum, uniqStringToString } from '../scripts'
import { useDecisionFromBlockchain } from './useDecisionFromBlockchain';

export const useResults = (qvAddress: string, isAddress: boolean, eth: any, voterAddress: string, setResults: (a: QVBSC.ResultDecision) => any) => {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [d, setD] = useState<QVBSC.VotingDecision>()
    useDecisionFromBlockchain(qvAddress, isAddress, eth, voterAddress, setD)

    useEffect(() => {
        if (isAddress && d) {
            getResults();
        }
    }, [qvAddress, isAddress, d])

    async function getResults() {
        if (!loading) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(eth.current)
                const qvote = new Contract(qvAddress, abi, provider.getSigner());
                const res = await qvote.getResults();
                console.log({ res, d })
                setResults(processResults(res, d))
                setLoading(false);
            } catch (e) {
                console.error(e)
            }
            setLoading(false);
        }
        setChecked(true)
    }

    function processResults(res: [string[], any[]], d: QVBSC.VotingDecision) {
        const resVotes = res[1];
        const resOptions = res[0].map(ethers.utils.parseBytes32String).map((i, index) => {
            const [uid, optName] = uniqStringToString(i);
            const op: QVBSC.ResultOption = {
                optName,
                uid,
                votes: getNumberFromBigNum(resVotes[index])
            }
            return op;
        })
        resOptions.sort((a, b) => b.votes - a.votes)
        return { ...d, options: resOptions }
    }

    return { loadingDecision: loading, checkedDecision: checked }
}