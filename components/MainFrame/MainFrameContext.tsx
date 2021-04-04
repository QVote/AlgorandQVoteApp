import { createContext, MutableRefObject } from "react";
import { useContractAddresses } from "../../hooks/useContractAddresses";
import { useJobScheduler } from "../../hooks/useJobScheduler";
import { BlockchainInfo, BLOCKCHAINS } from "../../config";
import type { NotificationHandle } from "./Notification";
import type { LongNotificationHandle } from "./LongNotification";
import type { MenuHandle } from "./MenuBar";

export const MainFrameContext = createContext<{
  curAcc: string | undefined;
  connected: boolean;
  blockchainInfo: BlockchainInfo;
  contractAddressses: ReturnType<typeof useContractAddresses>;
  jobsScheduler: ReturnType<typeof useJobScheduler>;
  notification: MutableRefObject<NotificationHandle>;
  longNotification: MutableRefObject<LongNotificationHandle>;
  menu: MutableRefObject<MenuHandle>;
}>({
  curAcc: undefined,
  connected: undefined,
  blockchainInfo: undefined,
  contractAddressses: undefined,
  jobsScheduler: undefined,
  notification: undefined,
  longNotification: undefined,
  menu: undefined,
});
