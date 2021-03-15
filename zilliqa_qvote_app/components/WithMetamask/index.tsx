import { Heading, Box, Anchor } from 'grommet';
import { useEth } from '../../hooks/useEth'
import { ConnectToWallet } from './ConnectToWallet';
import _config from '../../config';
import { useRouter } from 'next/router'

export function WithMetamask({ children }: { children: React.ReactNode }) {
    const { loadingProvider, thereIsAProvider, eth } = useEth();
    const router = useRouter();

    return (
        <Box align="center" fill pad="medium" gap="medium">
            <Box onClick={() => router.push('/')}>
                <Heading margin="none">{"QVote x  Binance Smart Chain"}</Heading>
            </Box>

            {
                thereIsAProvider && !loadingProvider ?
                    <ConnectToWallet eth={eth} children={children} />
                    :
                    <Heading>{"Please install a wallet first"}</Heading>
            }
        </Box >
    );
}