// import { ethers, Contract } from 'ethers'
import { QVoteZilliqa } from '@qvote/zilliqa-sdk';
import { useEffect, useState } from 'react'
import { QVote } from '../types';
// import { getNumberFromBigNum, uniqStringToString } from '../scripts'
import { useDecisionFromBlockchain } from './useDecisionFromBlockchain';

export const useResults = (qvAddress: string, isAddress: boolean, zil: any, voterAddress: string, setResults: (a: QVote.ResultDecision) => any) => {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [d, setD] = useState<QVote.VotingDecision>()
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

    function processResults(res: [string[], any[]], d: QVote.VotingDecision) {
        const resVotes = res[1];
        const resOptions = res[0].map(ethers.utils.parseBytes32String).map((i, index) => {
            const [uid, optName] = uniqStringToString(i);
            const op: QVote.ResultOption = {
                optName,
                votes: getNumberFromBigNum(resVotes[index])
            }
            return op;
        })
        resOptions.sort((a, b) => b.votes - a.votes)
        return { ...d, options: resOptions }
    }

    return { loadingDecision: loading, checkedDecision: checked }
}
