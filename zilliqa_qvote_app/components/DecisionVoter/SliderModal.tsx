import {
    Box,
    Button,
    TextInput,
    Layer,
    RangeInput,
    Card
} from "grommet";
import { Add, Subtract, } from "grommet-icons";
import { useState } from "react";
import { QVote } from "../../types";
import PosWithMeters from "./PosWithMeters";
import { intPls } from './utill'

type anonFunction = (...args: any[]) => unknown


function SliderModal({ sliderState, setSlider, onClickOutside, globalMax }:
    {
        sliderState: QVote.SliderState,
        setSlider: anonFunction,
        onClickOutside: anonFunction,
        globalMax: number
    }) {
    const SLIDER_MIN = -sliderState.max;
    const [sliderVal, setSlideVal] = useState(intPls(sliderState.cur));
    const [isAddDisabled, setIsAddDisabled] = useState(sliderVal == sliderState.max);
    const [isSubtractDisabled, setIsSubtractDisabled] = useState(sliderVal == SLIDER_MIN);
    function onPlus() {
        if (sliderVal < sliderState.max) {
            let newVal = intPls(sliderVal) + 1;
            setSlideVal(newVal);
        } else setIsAddDisabled(true);
        setIsSubtractDisabled(sliderVal == SLIDER_MIN);
    }
    function onMinus() {
        if (sliderVal > SLIDER_MIN) {
            let newVal = intPls(sliderVal) - 1;
            setSlideVal(newVal);
        } else setIsSubtractDisabled(true);
        setIsAddDisabled(sliderVal == sliderState.max);
    }
    function onChangeSliderVal(v) {
        setIsAddDisabled(v == sliderState.max);
        setIsSubtractDisabled(v == SLIDER_MIN);
        setSlideVal(v);
    }

    return (
        <Layer
            animation="slide"
            onClickOutside={() => onClickOutside()}
            responsive={false}
        >
            <Card gap="xsmall" align="center" background="white" pad="large">
                <PosWithMeters
                    optName={sliderState.optName}
                    credits={sliderVal}
                    maxCredits={globalMax}
                    props={{ elevation: "none" }}
                    flex
                />
                <Box direction="row" align="center" gap="small">
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
                    onClick={() =>
                        setSlider(
                            { ...sliderState, cur: intPls(sliderVal) }
                        )
                    }
                />
            </Card>
        </Layer>
    );
}

export { SliderModal };
