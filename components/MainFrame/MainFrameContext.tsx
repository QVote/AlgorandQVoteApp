import { createContext, MutableRefObject } from "react";
import { useQueues } from "../../hooks/useQueues";
import { useJobScheduler } from "../../hooks/useJobScheduler";
import type { MenuHandle } from "./MenuBar";

export const MainFrameContext = createContext<{
    useQueues: ReturnType<typeof useQueues>;
    jobsScheduler: ReturnType<typeof useJobScheduler>;
    menu: MutableRefObject<MenuHandle>;
}>({
    useQueues: undefined,
    jobsScheduler: undefined,
    menu: undefined,
});
