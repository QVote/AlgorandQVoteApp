import React from "react";
import { useMainContext } from "../hooks/useMainContext";
import { TwoCards } from "../components/TwoCards";
import { Box, Button, Text } from "grommet";
import { Add } from "grommet-icons";
import { QHeading } from "../components/QHeading";
import { QParagraph } from "../components/QParagraph";
import { ScrollBox } from "../components/ScrollBox";
import { Address } from "../components/Address";
import { useRouter } from "next/router";

export default function Queues() {
  const main = useMainContext();
  const router = useRouter();

  return (
    <TwoCards
      Card1={
        <Box fill>
          <QHeading>{"Recent queues"}</QHeading>
          <QParagraph>
            Here you can view recent queues that hold references to decisions.
          </QParagraph>
        </Box>
      }
      Card2={
        <ScrollBox props={{ gap: "medium" }}>
          <Button onClick={() => router.push("create-queue")}>
            <Box
              fill="horizontal"
              height={{ min: "xxsmall" }}
              background="dark-1"
              round="xsmall"
              align="center"
              justify="center"
              direction="row"
              gap="small"
            >
              <Add />
              <Text>{"Create"}</Text>
            </Box>
          </Button>
          {main.useQueues.addresses.length == 0 && (
            <QParagraph>You have no recent queues.</QParagraph>
          )}
          {main.useQueues.addresses.length > 0 &&
            main.useQueues.addresses.map((a) => (
              <Address txt={a} key={`contractqueue${a}`} onClick={() => {}} />
            ))}
        </ScrollBox>
      }
      NextButton={<Box fill />}
    />
  );
}
