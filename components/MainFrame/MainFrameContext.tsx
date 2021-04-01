import { createContext , MutableRefObject} from "react";
import { useContractAddresses } from "../../hooks/useContractAddresses";
import { BlockchainInfo, BLOCKCHAINS } from "../../config";
import type { NotificationHandle } from "./Notification";

export const MainFrameContext = createContext<{
  curAcc: string | undefined;
  connected: boolean;
  blockchainInfo: BlockchainInfo;
  contractAddressses: ReturnType<typeof useContractAddresses>;
  notification: MutableRefObject<NotificationHandle>
}>({
  curAcc: undefined,
  connected: false,
  blockchainInfo: BLOCKCHAINS.private,
  contractAddressses: undefined,
  notification: undefined
});
