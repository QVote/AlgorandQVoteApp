import React from "react";
import { Layer, Box, Text, Button } from "grommet";
import { StatusGood, Close, StatusCritical, StatusInfo } from "grommet-icons";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import { sleep } from "../../scripts";

type NotificationTypes = {
    bg: string;
    txtColor: string;
    icon: JSX.Element;
};

type NotificationKeys = "loading" | "success" | "error";

const notificationTypes: {
    [key in NotificationKeys]: NotificationTypes;
} = {
    error: {
        bg: "status-error",
        txtColor: "white",
        icon: <StatusCritical color={"white"} />,
    },
    success: {
        bg: "status-ok",
        txtColor: "white",
        icon: <StatusGood color={"white"} />,
    },
    loading: {
        bg: "status-unknown",
        txtColor: null,
        icon: <StatusInfo />,
    },
};

class LongNotificationState {
    text = "";
    notificationType = notificationTypes.loading;
    show = false;

    constructor() {
        makeAutoObservable(this);
    }

    async showNotification(text: string, type: NotificationKeys) {
        if (!this.show) {
            this.show = true;
            this.notificationType = notificationTypes[type];
            this.text = text;
            await sleep(3000);
            this.close();
        }
    }
    close() {
        this.show = false;
    }
}

export const longNotification = new LongNotificationState();

export const LongNotification = observer(() => {
    return longNotification.show ? (
        <Layer
            position="bottom-right"
            modal={false}
            margin={{ vertical: "medium", horizontal: "small" }}
            onEsc={longNotification.close}
            responsive={false}
            plain
        >
            <Box
                align="center"
                direction="row"
                gap="small"
                justify="between"
                round="medium"
                elevation="medium"
                pad={"medium"}
                background={longNotification.notificationType.bg}
            >
                {longNotification.notificationType.icon}
                <Box align="center" direction="row" gap="xsmall" width="100%">
                    <Text
                        textAlign="center"
                        size="small"
                        color={longNotification.notificationType.txtColor}
                    >
                        {longNotification.text}
                    </Text>
                </Box>
                <Button
                    icon={
                        <Close
                            size="small"
                            color={longNotification.notificationType.txtColor}
                        />
                    }
                    onClick={() => longNotification.close()}
                    plain
                />
            </Box>
        </Layer>
    ) : (
        <Box />
    );
});
