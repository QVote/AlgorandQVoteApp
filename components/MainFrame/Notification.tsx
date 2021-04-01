import React, { useState, useImperativeHandle, forwardRef } from "react";
import type { MutableRefObject } from "react";
import { Layer, Box, Text, Button } from "grommet";
import { StatusGood, FormClose } from "grommet-icons";

export type NotificationHandle = {
  onShowNotification: (txt: string) => void;
  onCloseShowNotification: () => void;
};

function NotificationComp(
  props: {},
  ref: MutableRefObject<NotificationHandle>
) {
  const [showNotification, setShowNotification] = useState(false);
  const [txt, setTxt] = useState("");

  useImperativeHandle(ref, () => ({
    onShowNotification,
    onCloseShowNotification,
  }));

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
      position="top"
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
        background="status-ok"
      >
        <StatusGood color="white" size="small" />
        <Box align="center" direction="row" gap="xsmall" width="100%">
          <Text textAlign="center" color="white" size="small">
            {txt}
          </Text>
        </Box>
        <Button
          icon={<FormClose color="white" size="small" />}
          onClick={onCloseShowNotification}
          plain
        />
      </Box>
    </Layer>
  ) : (
    <Box />
  );
}

export const Notification = forwardRef(NotificationComp);
