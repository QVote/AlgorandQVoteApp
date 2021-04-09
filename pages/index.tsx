import React from "react";
import { TwoCards } from "../components/TwoCards";
import { Address } from "../components/Address";
import { useMainContext } from "../hooks/useMainContext";
import { Notice } from "../components/Notice";
import { ScrollBox } from "../components/ScrollBox";
import { onGoToAs } from "../components/utill";
import { useRouter } from "next/router";
import { onCopyText } from "../components/utill";
import { Box } from "grommet";
import { QHeading } from "../components/QHeading";
import { QParagraph } from "../components/QParagraph";

const PATHS = {
  preview: { path: "/[address]/preview", as: "/preview" },
};

export default function Index() {
  const main = useMainContext();
  const router = useRouter();

  return (
    <TwoCards
      Card1={
        <Box fill>
          <QHeading>{"Recent decisions"}</QHeading>
          <QParagraph>Here you can view recent decisions.</QParagraph>
        </Box>
      }
      Card2={
        <ScrollBox props={{ gap: "medium" }}>
          {main.useContracts.addresses.length == 0 && (
            <QParagraph>You have no recent decisions.</QParagraph>
          )}
          {main.useContracts.addresses.length > 0 &&
            main.useContracts.addresses.map((a) => (
              <Address
                txt={a}
                key={`contractdecision${a}`}
                onClick={() =>
                  onGoToAs(PATHS.preview.path, PATHS.preview.as, router, a)
                }
                onCopyTxt={() => onCopyText(a, "Address Copied!", main)}
              />
            ))}
        </ScrollBox>
      }
      NextButton={<Box fill />}
    />
  );
}
