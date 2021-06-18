import { onCopy, notArrPlz } from "../scripts";
import type { NextRouter } from "next/router";
import { longNotification, notification } from "./Notifications";

export function networkNotSupported() {
    try {
        longNotification.showNotification(
            "Viewblock not supported on current network.",
            "error"
        );
    } catch (e) {
        console.error(e);
    }
}

export function onCopyText(txt: string, notificationTxt: string) {
    onCopy(txt);
    notification.showNotification(notificationTxt);
}

export async function onGoToAs(
    path: string,
    asPost: string,
    r: NextRouter,
    address: string | string[]
) {
    await r.push(path, "/" + notArrPlz(address) + asPost);
}
