import type { useMainContext } from "../hooks/useMainContext";
import { onCopy, notArrPlz } from "../scripts";
import type { NextRouter } from "next/router";
import { longNotification } from "./MainFrame/LongNotification";

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

export function onCopyText(
    txt: string,
    notification: string,
    main: ReturnType<typeof useMainContext>
) {
    onCopy(txt);
    main.notification.current.onShowNotification(notification);
}

export async function onGoToAs(
    path: string,
    asPost: string,
    r: NextRouter,
    address: string | string[]
) {
    await r.push(path, "/" + notArrPlz(address) + asPost);
}
