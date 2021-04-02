import { createContext, MutableRefObject } from "react";
import { useContractAddresses } from "../../hooks/useContractAddresses";
import { useJobScheduler } from "../../hooks/useJobScheduler";
import { BlockchainInfo, BLOCKCHAINS } from "../../config";
import type { NotificationHandle } from "./Notification";
import type { LongNotificationHandle } from "./LongNotification";

export const MainFrameContext = createContext<{
  curAcc: string | undefined;
  connected: boolean;
  blockchainInfo: BlockchainInfo;
  contractAddressses: ReturnType<typeof useContractAddresses>;
  jobsScheduler: ReturnType<typeof useJobScheduler>;
  notification: MutableRefObject<NotificationHandle>;
  longNotification: MutableRefObject<LongNotificationHandle>;
}>({
  curAcc: undefined,
  connected: false,
  blockchainInfo: BLOCKCHAINS.private,
  contractAddressses: undefined,
  jobsScheduler: undefined,
  notification: undefined,
  longNotification: undefined,
});
