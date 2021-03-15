import { useState, useContext, useEffect } from 'react';
import { QVBSC } from '../../types';
import { Voter } from './Voter'
import { GlobalContext } from '../GlobalContext';
import { Text } from 'grommet';
import { useDecisionFromBlockchain } from '../../hooks/useDecisionFromBlockchain';


export function DecisionVoter() {
    const [decision, setDecision] = useState<QVBSC.VotingDecision | undefined>();
    const g = useContext(GlobalContext);
    const { checkedDecision } = useDecisionFromBlockchain(g.qvoteAddress, g.isAddress, g.eth, g.accounts[0], setDecision)

    return (
        decision ?
            <Voter d={decision} setDecision={setDecision} />
            :
            checkedDecision || !g.isAddress ?
                <Text>{"Put your QVote contract address above"}</Text>
                :
                null
    )
}