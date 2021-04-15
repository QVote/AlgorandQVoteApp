import type { useMainContext } from "../hooks/useMainContext";
import { onCopy, notArrPlz } from "../scripts";
import type { NextRouter } from "next/router";

export function networkNotSupported(main: ReturnType<typeof useMainContext>) {
  try {
    main.longNotification.current.setError();
    main.longNotification.current.onShowNotification(
      "Viewblock not supported on current network."
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
