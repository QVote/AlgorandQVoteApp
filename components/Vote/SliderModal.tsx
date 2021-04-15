import React, { useState } from "react";
import { Box, Button, TextInput, Layer, RangeInput, Card } from "grommet";
import { Add, Subtract } from "grommet-icons";
import { PosWithMeters } from "./PosWithMeters";
import { intPls } from "../../scripts";
import { onSliderConfirm } from "./utill";
import { QVote } from "../../types";

type anonFunction = (...args: any[]) => unknown;

function SliderModal({
  sliderState,
  setSlider,
  onClickOutside,
  globalMax,
}: {
  sliderState: QVote.SliderDs;
  setSlider: onSliderConfirm;
  onClickOutside: anonFunction;
  globalMax: number;
}) {
  const SLIDER_MIN = -sliderState.max;
  const [sliderVal, setSlideVal] = useState(intPls(sliderState.cur));
  const [isAddDisabled, setIsAddDisabled] = useState(
    sliderVal == sliderState.max
  );
  const [isSubtractDisabled, setIsSubtractDisabled] = useState(
    sliderVal == SLIDER_MIN
  );
  function onPlus() {
    if (sliderVal < sliderState.max) {
      const newVal = intPls(sliderVal) + 1;
      setSlideVal(newVal);
    } else setIsAddDisabled(true);
  }
  function onMinus() {
    if (sliderVal > SLIDER_MIN) {
      const newVal = intPls(sliderVal) - 1;
      setSlideVal(newVal);
    } else setIsSubtractDisabled(true);
  }
  function onChangeSliderVal(v: number | string) {
    v = intPls(v);
    setIsAddDisabled(v == sliderState.max);
    setIsSubtractDisabled(v == SLIDER_MIN);
    setSlideVal(v);
  }

  return (
    <Layer onClickOutside={() => onClickOutside()} responsive={false}>
      <Card gap="medium" align="center" background="qvBg" pad="medium">
        <PosWithMeters
          noElevate
          optionName={sliderState.name}
          credits={sliderVal}
          maxCredits={globalMax}
        />
        <Box
          direction="row"
          align="center"
          gap="small"
          pad={{ bottom: "small" }}
        >
          <Button
            plain={false}
            disabled={isSubtractDisabled}
            icon={<Subtract color="neutral-2" />}
            onClick={() => onMinus()}
          />
          <Box align="center" width="medium">
            <RangeInput
              value={sliderVal}
              min={SLIDER_MIN}
              max={sliderState.max}
              step={1}
              onChange={(e) => onChangeSliderVal(e.target.value)}
            />
          </Box>
          <Button
            plain={false}
            disabled={isAddDisabled}
            icon={<Add color="neutral-2" />}
            onClick={() => onPlus()}
          />
        </Box>
        <Button
          primary
          plain={false}
          label="Confirm"
          onClick={() => setSlider(sliderState.name, intPls(sliderVal))}
        />
      </Card>
    </Layer>
  );
}

export default SliderModal;
