import { Text, Box } from 'grommet'
import { useResults } from '../hooks/useResults'
import { GlobalContext } from '../components/GlobalContext';
import { useContext, useState } from 'react';
import { QVBSC } from '../types';
import { DecisionPreview } from '../components/DecisionCreator/DecisionPreview';

export default function Results() {
    const g = useContext(GlobalContext);
    const [results, setResults] = useState<undefined | QVBSC.ResultDecision>()
    const { checkedDecision } = useResults(g.qvoteAddress, g.isAddress, g.eth, g.accounts[0], setResults);

    return (
        <Box fill direction="row" gap="large" pad="medium"
            animation={[
                { type: "fadeIn", duration: 1000 },
                { type: "slideLeft", duration: 1000 },
            ]}>
            { typeof results != "undefined" ?
                <DecisionPreview r={results} />
                :
                checkedDecision || !g.isAddress &&
                <Box align="center" fill="horizontal" >
                    <Text>{"Put your QVote contract address above"}</Text>
                </Box>
            }
        </Box>
    )
}