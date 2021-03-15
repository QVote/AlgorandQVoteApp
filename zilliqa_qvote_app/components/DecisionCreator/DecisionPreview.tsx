//@ts-nocheck
import { QVBSC } from "../../types";
import { Text, Box, Button } from 'grommet'
import { Trash, FormEdit } from 'grommet-icons'

function formatMilisecondsToDateString(milis: number) {
    return new Date(milis).toLocaleString();
}

function Disp({ t, toDisp }: { t: string, toDisp: string }) {
    return (
        <Box gap="xxsmall">
            <Text weight="bold">{t}</Text>
            <Text wordBreak="break-all">{toDisp}</Text>
        </Box>
    )
}

export function DecisionPreview({ d, r, onDeleteOption, onClickOption }:
    { d?: QVBSC.Decision, r?: QVBSC.ResultDecision, onDeleteOption?: (o: QVBSC.Option) => void, onClickOption?: (o: QVBSC.Option) => any }) {
    const dec = d ? d : r;
    return (
        <Box flex round="small" pad="medium" gap="small">
            <Box gap="small" height={{ min: "190px" }}>
                <Disp t={"Name:"} toDisp={dec.name} />
                <Disp t={"Details:"} toDisp={dec.description} />
                {dec.endTime && <Disp t={"EndTime:"} toDisp={formatMilisecondsToDateString(dec.endTime)} />}
                {
                    dec.options.length != 0 &&
                    <Text weight="bold">{`Options:`}</Text>
                }
            </Box>
            <Box overflow={{ vertical: "auto" }} height={{ max: "large" }} elevation={dec.options.length == 0 ? "none" : "xsmall"} pad="medium" >
                {
                    dec.options.map((o) => {
                        return (
                            <Box
                                key={o.uid}
                                direction="row"
                                align="center"
                                justify="between"
                                height={{ min: "xsmall" }}
                            >
                                <Text wordBreak="break-all">
                                    {o.optName}<br />
                                    {o.votes && (o.votes / 100 + " votes")}
                                </Text>
                                {
                                    onDeleteOption &&
                                    <Button icon={<Trash />} onClick={() => onDeleteOption(o)} />
                                }
                                {
                                    onClickOption &&
                                    <Button icon={<FormEdit />} onClick={() => onClickOption(o)} />
                                }
                            </Box>
                        )
                    })
                }
            </Box>
        </Box>
    )
}