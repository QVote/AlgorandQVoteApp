import React, { useEffect } from "react";
import { Box } from "grommet";
import { useRouter } from "next/router";
import { MenuBar } from "./MenuBar";
import { Notification, LongNotification } from "../Notifications";
import { zilliqaApi } from "../../helpers/Zilliqa";
import { observer } from "mobx-react";

export const MainFrame = observer(({ children }: { children: JSX.Element }) => {
    const router = useRouter();
    useEffect(() => {
        zilliqaApi.connect();
    }, []);

    useEffect(() => {
        if (zilliqaApi.connected) {
            const { address, queueAddress } = router.query;
            zilliqaApi.tryToGetContract(address);
            zilliqaApi.tryToGetQueueState(queueAddress);
        }
    }, [router.query, zilliqaApi.currentAddress, zilliqaApi.connected]);

    /**
     * Essentially regenerate the jobs that were in progress but the site was
     * refreshed
     */
    useEffect(() => {
        if (zilliqaApi.connected) {
            zilliqaApi.regenerateJobs();
        }
    }, [zilliqaApi.connected]);

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
