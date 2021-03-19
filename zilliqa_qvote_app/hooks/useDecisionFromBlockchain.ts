// import { ethers, Contract } from 'ethers'
import { useEffect, useState } from 'react'
import { QVote } from '../types';
import { QVoteZilliqa } from '@qvote/zilliqa-sdk';
import { unConcatStrings, uniqStringToString, getNumberFromBigNum } from '../scripts'

export const useDecisionFromBlockchain = (qvAddress: string, isAddress: boolean, zil: any, voterAddress: string, setDecision: (a: QVote.VotingDecision) => any) => {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (isAddress) {
            getDecision();
        }
    }, [qvAddress, isAddress])

    async function getDecision() {
        if (!loading) {
            try {
                setLoading(true)
				const qv = new QVoteZilliqa(); 
				const instance = zil.contracts.at(qvAddress);   // address is in zil format 
				const s = await instance.getState(); 
				const init = await instance.getInit(); 
				const decisionState = qv.parseInitAndState(init, s); 
				setDecision(processRes(decisionState, s));     // TODO finish this 

                /*const provider = new ethers.providers.Web3Provider(eth.current)
                const qvote = new Contract(qvAddress, abi, provider.getSigner());
                const res = await qvote.getVotingInfo();
                const c = await qvote.getBalanceOf(voterAddress);
                setDecision(processRes(res, c)); */

                setLoading(false);
            } catch (e) {
                console.error(e)
            }
            setLoading(false);
        }
        setChecked(true);
    }
	
	function prepareDecision(contractState: any, voterAddress : string) : QVote.VotingDecision {
		const name = contractState.name; 
		const description = contractState.description; 
		const credits = contractState.voter_balances[voterAddress.toLowerCase()]; 
		const options = 
		const res : QVote.VotingDecision = {
			
		};
		return res; 
	}
	
	// TODO change this to process the state and retreive name, info, and votes 
    function processRes(r: [string, string, string[]], cre: ethers.BigNumber) {
        const [name, description] = unConcatStrings(r[1]);
        const credits = getNumberFromBigNum(cre)
        const options = r[2].map(ethers.utils.parseBytes32String).map(i => {
            const [uid, optName] = uniqStringToString(i);
            const op: QVote.SliderState = {
                max: credits,
                min: 0,
                optName,
                uid,
                cur: 0
            }
            return op;
        })
        const res: QVote.VotingDecision = {
            name,
            description,
			// TODO check next two lines 
            credits,   // these are max credits allowed in the election 
            creditsRemaining: credits,   // sure? 
            options
        }
        return res;
    }

    return { loadingDecision: loading, checkedDecision: checked }
}
