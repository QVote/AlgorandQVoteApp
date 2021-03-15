import { Box, TextInput } from 'grommet';
import { ethers } from 'ethers';
import { Checkmark, Close } from 'grommet-icons';

export function WithQVoteContractAddress({ qvoteAddress, onUpdateAddress, isAddress}) {

    return (
        <Box align="center" width={{min:"530px"}}>
            <TextInput
                icon={isAddress ? <Checkmark /> : <Close />}
                placeholder="QVote contract address"
                value={qvoteAddress}
                maxLength={42}
                onChange={(e) => onUpdateAddress(e.target.value)}
            />
        </Box >
    )
}