// import { ethers, Contract } from 'ethers'
import { useEffect, useState } from 'react'
import { QVote } from '../types';
import { QVoteZilliqa } from '@qvote/zilliqa-sdk';
// import { unConcatStrings, uniqStringToString, getNumberFromBigNum } from '../scripts'

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
				// setDecision(processRes(decisionState, s));     
				setDecision(processState(decisionState, voterAddress));

                setLoading(false);
            } catch (e) {
                console.error(e)
            }
            setLoading(false);
        }
        setChecked(true);
    }
	
    /*function processRes(r: [string, string, string[]], cre: ethers.BigNumber) {
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
            creditsRemaining: credits,   // sure? 
            options
        }
        return res;
    } */ 
	
	function processState(state: any, voterAddress: string) : QVote.VotingDecision {
        const credits = state.voter_balances[voterAddress.toLowerCase()]
        const res = {
            name: state.name, 
            description: state.description,
            creditsRemaining: credits,
            options: state.options          
        }
        return res;
    }


    return { loadingDecision: loading, checkedDecision: checked }
}
