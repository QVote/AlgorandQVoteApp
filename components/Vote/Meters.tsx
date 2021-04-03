import React from "react";
import { Box, Meter } from "grommet";
import { getVotesFromCredits } from "./utill";

function Meters({ credits, maxCredits, onlyPos }:
    { credits: number, maxCredits: number, onlyPos: boolean }) {
    const invert = { transform: "scaleX(-1)" };
    function getPercentage(c:number, m:number):number {
        if (c < 0) {
            return 0;
        }
        if (m == 0) {
            return 0;
        }
        return (c / m) * 100;
    }

    function getNegativePercentage(c:number, m:number):number {
        if (c > 0) {
            return 0;
        }
        const abs = Math.abs(c);
        if (m == 0) {
            return 0;
        }
        return (abs / m) * 100;
    }

    const METER_HEIGHT = "40px";

    return (
        <Box direction="row" height={{ min: METER_HEIGHT, max: METER_HEIGHT }} gap="small">
            {!onlyPos && (
                <Box>
                    <Meter
                        // @ts-ignore
                        style={invert}
                        type="bar"
                        round={true}
                        background="light-2"
                        values={[
                            {
                                value: getNegativePercentage(credits, maxCredits),
                                color: "#90004f",
                            },
                        ]}
                    />
                    <Meter
                        // @ts-ignore
                        style={invert}
                        round={true}
                        type="bar"
                        values={[
                            {
                                value: getNegativePercentage(
                                    getVotesFromCredits(credits),
                                    maxCredits
                                ),
                                color: "#82b324",
                            },
                        ]}
                    />
                </Box>
            )}
            <Box>
                <Meter
                    type="bar"
                    background="light-2"
                    round={true}
                    values={[
                        {
                            value: getPercentage(credits, maxCredits),
                        },
                    ]}
                />
                {!onlyPos && (
                    <Meter
                        round={true}
                        type="bar"
                        values={[
                            {
                                value: getPercentage(getVotesFromCredits(credits), maxCredits),
                                color: "brand",
                            },
                        ]}
                    />
                )}
            </Box>
        </Box >
    );
}

export default Meters;