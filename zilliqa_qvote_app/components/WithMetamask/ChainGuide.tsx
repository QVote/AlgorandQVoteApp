import _config from '../../config';
import { Box, Heading } from 'grommet';
import {CopyOnly} from './CopyOnly'

export const ChainGuide = () => {
    return (
        <Box>
            <Heading textAlign="center">{"Please use:"}</Heading>
            <CopyOnly arr={[
                ["Network Name", _config.NETWORK_NAME],
                ["RPC URL", _config.RPC_URL],
                ["ChainID", _config.CHAIN_ID]
            ]} />
        </Box >
    )
}