import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import type { MutableRefObject } from "react";
import { Layer, Box, Text, Button } from "grommet";
import { StatusGood, Close, StatusCritical, StatusInfo } from "grommet-icons";

export type LongNotificationHandle = {
  onShowNotification: (txt: string) => void;
  onCloseShowNotification: () => void;
  setLoading: () => void;
  setSuccess: () => void;
  setError: () => void;
};

type NotificationTypes = {
  bg: string;
  txtColor: string;
  type: "loading" | "success" | "error";
};

const loading: NotificationTypes = {
  bg: "status-unknown",
  txtColor: null,
  type: "loading",
};

const success: NotificationTypes = {
  bg: "status-ok",
  txtColor: "white",
  type: "success",
};

const error: NotificationTypes = {
  bg: "status-error",
  txtColor: "white",
  type: "error",
};

function LongNotificationComp(
  props: {},
  ref: MutableRefObject<LongNotificationHandle>
) {
  const [showNotification, setShowNotification] = useState(false);
  const [txt, setTxt] = useState("");
  const [custom, setCustom] = useState(loading);

  useImperativeHandle(ref, () => ({
    onShowNotification,
    onCloseShowNotification,
    setLoading,
    setSuccess,
    setError,
  }));

  const setLoading = () => {
    setCustom(loading);
  };
  const setSuccess = () => {
    setCustom(success);
  };
  const setError = () => {
    setCustom(error);
  };

  const onShowNotification = (txt: string) => {
    if (!showNotification) {
      setShowNotification(true);
      setTxt(txt);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };
  const onCloseShowNotification = () => setShowNotification(false);

  return showNotification ? (
    <Layer
      position="bottom-right"
      modal={false}
      margin={{ vertical: "medium", horizontal: "small" }}
      onEsc={onCloseShowNotification}
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
        background={custom.bg}
      >
        {custom.type == "loading" && <StatusInfo color={custom.txtColor} />}
        {custom.type == "success" && <StatusGood color={custom.txtColor} />}
        {custom.type == "error" && <StatusCritical color={custom.txtColor} />}
        <Box align="center" direction="row" gap="xsmall" width="100%">
          <Text textAlign="center" size="small" color={custom.txtColor}>
            {txt}
          </Text>
        </Box>
        <Button
          icon={<Close size="small" color={custom.txtColor} />}
          onClick={onCloseShowNotification}
          plain
        />
      </Box>
    </Layer>
  ) : (
    <Box />
  );
}

export const LongNotification = forwardRef(LongNotificationComp);
