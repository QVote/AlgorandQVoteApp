import React, { useEffect } from "react";
import { Text } from "grommet";
import { useMainContext } from "../hooks/useMainContext";

export default function Vote() {
  const main = useMainContext();

  return <Text>{JSON.stringify(main.contractAddressses.currentContract, null, 4)}</Text>;
}
