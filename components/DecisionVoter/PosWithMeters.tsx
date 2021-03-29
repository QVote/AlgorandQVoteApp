import {
    Text,
    Box,
    Card
} from "grommet";
import { FormNextLink } from "grommet-icons";
import { getVotesFromCredits } from './utill'
import Meters from './Meters';

function CreditToVote({ credits }) {
    return (
        <Box direction="row">
            <Text>{`${Math.abs(credits)} credits`}</Text>
            <FormNextLink color="neutral-2" />
            <Text>{`${getVotesFromCredits(credits)} votes`}</Text>
        </Box>
    );
}

function PosWithMeters({ optName, credits, maxCredits, onClick, props, flex }:
    {
        optName: string, credits: number, maxCredits: number,
        onClick?: any, props?: any, flex?: boolean
    }) {
    let toSpread: any = {};
    if (onClick) {
        toSpread.onClick = onClick;
    }
    const POS_HEIGHT = "190px";
    if (!flex) {
        toSpread.height = { min: POS_HEIGHT, max: POS_HEIGHT }
    }
    return (
        <Card pad="medium" gap="xsmall" {...toSpread} {...props}>
            <Text>{`${optName}`
            } </Text>
            <CreditToVote credits={credits} />
            <Meters credits={credits} maxCredits={maxCredits} onlyPos={false} />
        </Card >
    );
}

export default PosWithMeters;