import React, { useEffect } from "react";
import { Box } from "grommet";
import { useRouter } from "next/router";
import { MenuBar } from "./MenuBar";
import {
    Notification,
    LongNotification,
    longNotification,
} from "../Notifications";
import { blockchain } from "../../helpers/Blockchain";
import { observer } from "mobx-react";

export const MainFrame = observer(({ children }: { children: JSX.Element }) => {
    const router = useRouter();

    useEffect(() => {
        if (blockchain().connected) {
            const { address, queueAddress } = router.query;
            blockchain().tryToGetContract(address);
            blockchain().tryToGetQueueState(queueAddress);
        }
    }, [router.query, blockchain().currentAddress, blockchain().connected]);

    /**
     * Essentially regenerate the jobs that were in progress but the site was
     * refreshed
     */
    useEffect(() => {
        if (blockchain().connected) {
            blockchain().regenerateJobs();
        }
    }, [blockchain().connected]);

    useEffect(() => {
        connect();
    }, []);

    async function connect() {
        try {
            await blockchain().connect();
        } catch (e) {
            console.error(e);
            longNotification.showNotification(
                e.message ? e.message : "Error",
                "error"
            );
        }
    }

    return (
        <Box
            height={{ min: "100vh", max: "100vh" }}
            width={{ min: "100vw", max: "100vw" }}
            overflow="hidden"
            fill={true}
            background={"light-2"}
        >
            <MenuBar />
            {children}
            <Notification />
            <LongNotification />
        </Box>
    );
});
