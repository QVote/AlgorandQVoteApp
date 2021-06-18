import React from "react";
import { Layer, Box, Text, Button } from "grommet";
import { StatusGood, Close } from "grommet-icons";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import { sleep } from "../../scripts";

class NotificationState {
    text = "";
    show = false;
    constructor() {
        makeAutoObservable(this);
    }
    async showNotification(text: string) {
        this.text = text;
        this.show = true;
        await sleep(3000);
        this.close();
    }
    close() {
        this.show = false;
    }
}

export const notification = new NotificationState();
export const Notification = observer(() => {
    return notification.show ? (
        <Layer
            position="top"
            modal={false}
            margin={{ vertical: "medium", horizontal: "small" }}
            onEsc={() => notification.close()}
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
                background="status-ok"
            >
                <StatusGood color="white" size="small" />
                <Box align="center" direction="row" gap="xsmall" width="100%">
                    <Text textAlign="center" color="white" size="small">
                        {notification.text}
                    </Text>
                </Box>
                <Button
                    icon={<Close color="white" size="small" />}
                    onClick={() => notification.close()}
                    plain
                />
            </Box>
        </Layer>
    ) : (
        <Box />
    );
});
