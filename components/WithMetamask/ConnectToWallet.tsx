import { MutableRefObject } from "react";
import { useWallet } from "../../hooks/useWallet";
import { Box, Button, Text } from "grommet";
import { ConnectedInterface } from "./ConnectedInterface";

export const ConnectToWallet = ({
  eth,
  children,
}: {
  eth: MutableRefObject<any>;
  children: React.ReactNode;
}) => {
  const {
    isWalletConnected,
    walletLoading,
    connectAccounts,
    walletErrTxt,
    accounts,
    walletErrorCode,
  } = useWallet({
    eth,
  });

  return (
    <Box gap="medium" fill>
      {isWalletConnected ? (
        <ConnectedInterface accounts={accounts} eth={eth} children={children} />
      ) : (
        <Box align="center">
          <Text>{walletErrTxt}</Text>
          <Button
            disabled={walletLoading}
            alignSelf="center"
            label={"Connect Wallet"}
            onClick={connectAccounts}
          />
        </Box>
      )}
    </Box>
  );
};
