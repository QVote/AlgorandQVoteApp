import {
  Box,
  Text,
  Heading,
  Button,
  ResponsiveContext,
} from "grommet";
import React, { useContext, useEffect } from "react";
import { Send } from "grommet-icons";
import { useState } from "react";
import { intPls } from "../../scripts";
import { createSlidersState } from "./utill";
import { PosWithMeters } from "./PosWithMeters";
import SliderModal from "./SliderModal";
import Meters from "./Meters";
import { onSliderConfirm } from "./utill";
import { QVote } from "../../types";
import { ScrollBox } from "../ScrollBox";
import { QParagraph } from "../QParagraph";

export function Vote({
  decision,
  userAllowedCredits,
}: {
  decision: QVote.ContractDecision;
  userAllowedCredits: number;
}) {
  const responsiveContext = useContext(ResponsiveContext);
  const [loading, setLoading] = useState(false);
  const [curCredDist, setCurCredDist] = useState(
    createSlidersState(decision, userAllowedCredits)
  );
  const [showSlider, setShowSlider] = useState(false);
  const [sliderState, setSliderState] = useState<QVote.SliderDs>({
    max: 0,
    min: 0,
    cur: 0,
    name: "",
  });

  useEffect(() => {
    setCurCredDist(createSlidersState(decision, userAllowedCredits));
  }, [decision]);

  //update all except one option
  function updateByExcept(ds: QVote.CreditDist, curName: string, diff: number) {
    ds.options = ds.options.map((o) => {
      if (curName != o.name) {
        return {
          ...o,
          max: o.max - diff,
        };
      } else {
        return o;
      }
    });
  }

  //return number of credits used
  function getUsed(ds: QVote.CreditDist): number {
    return ds.options.reduce((prev, o) => {
      return prev + Math.abs(intPls(o.cur));
    }, 0);
  }

  const setSlider: onSliderConfirm = (name: string, newVal: number) => {
    const used = getUsed(curCredDist);
    const curIndex = curCredDist.options.findIndex((o) => o.name == name);
    const prevVal = Math.abs(intPls(curCredDist.options[curIndex].cur));
    const diff = Math.abs(newVal) - prevVal;
    updateByExcept(curCredDist, name, diff);
    curCredDist.options[curIndex].cur = newVal;
    curCredDist.creditsRemaining = userAllowedCredits - (diff + used);
    setCurCredDist(curCredDist);
    setShowSlider(false);
  };

  function showGivenSlider(name: string): void {
    const curIndex = curCredDist.options.findIndex((o) => o.name == name);
    if (
      curCredDist.creditsRemaining === 0 &&
      curCredDist.options[curIndex].cur === 0
    ) {
      return;
    }
    setSliderState(curCredDist.options[curIndex]);
    setShowSlider(true);
  }

  const canSubmit = () =>
    !loading &&
    curCredDist.creditsRemaining === 0 &&
    getUsed(curCredDist) !== 0;

  async function onVoteSubmit() {
    if (canSubmit()) {
      setLoading(true);
      try {
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
  }

  return (
    <Box
      pad={{ horizontal: "large", vertical: "small" }}
      fill={true}
      gap="small"
    >
      {canSubmit() ? (
        <Box
          height={{ min: "100px", max: "100px" }}
          align="center"
          justify="end"
          pad={{ bottom: "medium" }}
        >
          <Button disabled={!canSubmit()} onClick={() => onVoteSubmit()}>
            <Box
              background={"brand"}
              round={"17px"}
              pad={"14px"}
              direction="row"
              gap="medium"
            >
              <Send />
              <Text weight="bold">{"Submit"}</Text>
            </Box>
          </Button>
        </Box>
      ) : (
        <CreditsLeft
          left={curCredDist.creditsRemaining}
          max={userAllowedCredits}
        />
      )}
      <ScrollBox props={{ gap: "small", pad: "medium" }}>
        <Box
          height={{ min: "medium" }}
          fill="horizontal"
          background="white"
          pad="large"
          align="center"
          round="xsmall"
          elevation="small"
          overflow="hidden"
        >
          <Heading
            style={{ wordBreak: "break-word" }}
            level={responsiveContext == "small" ? "3" : "2"}
          >
            {decision.name}
          </Heading>
          <QParagraph>{decision.description.replace(/\\n/g, "\n")}</QParagraph>
        </Box>

        {curCredDist.options.map((o, index) => {
          return (
            <PosWithMeters
              {...{
                onClick: () => showGivenSlider(o.name),
                credits: intPls(curCredDist.options[index].cur),
                maxCredits: userAllowedCredits,
                optionName: o.name,
                key: `posWithMeters ${o.name}`,
              }}
            />
          );
        })}
      </ScrollBox>
      {showSlider && (
        <SliderModal
          {...{
            sliderState,
            setSlider,
            onClickOutside: () => setShowSlider(false),
            globalMax: userAllowedCredits,
          }}
        />
      )}
    </Box>
  );
}

function CreditsLeft({ left, max }: { left: number; max: number }) {
  return (
    <>
      <Box
        round="xsmall"
        height={{ min: "100px", max: "100px" }}
        align="center"
        justify="end"
        background="white"
        margin={{ left: "medium", right: "medium" }}
        pad={{ horizontal: "large" }}
      >
        <Heading
          responsive={false}
          textAlign="center"
          level="3"
          size="small"
        >{`Credits Left: ${left}`}</Heading>
        <Meters credits={left} maxCredits={max} onlyPos />
      </Box>
    </>
  );
}
