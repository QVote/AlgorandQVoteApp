//@ts-nocheck
import React from "react";
import {
    Box,
    Button,
    Keyboard,
    Text,
    Calendar,
    MaskedInput,
    DropButton,
} from "grommet";
import { Schedule } from "grommet-icons";

const DropContent = ({ date: initialDate, time: initialTime, onClose }) => {
    const [date, setDate] = React.useState<{ select: string | string[] }>();
    const [time, setTime] = React.useState<string>();

    const close = () => onClose(date || initialDate, time || initialTime);

    return (
        <Box align="center" pad="medium">
            <Calendar
                size="small"
                animate={false}
                date={date || initialDate.toString()}
                onSelect={setDate}
                showAdjacentDays={false}
            />
            <Box flex={false} pad="medium" gap="medium">
                <Keyboard
                    onEnter={(event) => {
                        event.preventDefault(); // so drop doesn't re-open
                        close();
                    }}
                >
                    <MaskedInput
                        mask={[
                            {
                                length: [1, 2],
                                options: [
                                    "1",
                                    "2",
                                    "3",
                                    "4",
                                    "5",
                                    "6",
                                    "7",
                                    "8",
                                    "9",
                                    "10",
                                    "11",
                                    "12",
                                ],
                                regexp: /^1[1-2]$|^[0-9]$/,
                                placeholder: "hh",
                            },
                            { fixed: ":" },
                            {
                                length: 2,
                                options: ["00", "15", "30", "45"],
                                regexp: /^[0-5][0-9]$|^[0-9]$/,
                                placeholder: "mm",
                            },
                            { fixed: " " },
                            {
                                length: 2,
                                options: ["am", "pm"],
                                regexp: /^[ap]m$|^[AP]M$|^[aApP]$/,
                                placeholder: "ap",
                            },
                        ]}
                        value={time || initialTime}
                        name="maskedInput"
                        onChange={(event) => setTime(event.target.value)}
                        size="small"
                    />
                </Keyboard>
                <Box flex={false}>
                    <Button size="small" label="Done" onClick={close} />
                </Box>
            </Box>
        </Box>
    );
};

export const DateTimeDrop = ({ dt, onChange, placeholder }:
    { dt: { date: Date, time: string }, onChange: (args?: any) => any, placeholder: string }) => {
    const date = dt.date;
    const time = dt.time;
    const [open, setOpen] = React.useState<boolean>();

    const hourTextToMilis = (txt: string) => {
        let words = txt.split(":");
        // console.log(words);
        const hours = parseInt(words[0]);
        words = words[1].split(" ");
        // console.log(words);
        const minutes = parseInt(words[0]);
        let result = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
        if (words[1] == "pm") {
            result = result + 12 * 60 * 60 * 1000;
        }
        return result;
    };

    const onClose = (nextDate: Date, nextTime: string) => {
        const epoch = new Date(nextDate);
        epoch.setHours(0);
        epoch.setMinutes(0);
        epoch.setSeconds(0);
        epoch.setMilliseconds(0);
        const epochMilisec = epoch.getTime();
        const hours = hourTextToMilis(nextTime);
        const milis = epochMilisec + hours;
        //console.log(milis);
        onChange(milis);
        setOpen(false);
        setTimeout(() => setOpen(undefined), 1);
    };

    return (
        <Box pad="small">
            <DropButton
                open={open}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                dropContent={<DropContent date={date} time={time} onClose={onClose} />}
            >
                <Box direction="row" gap="medium" align="center" pad="small">
                    <Text color={date ? undefined : "dark-5"}>
                        {date
                            ? `${new Date(date).toLocaleDateString()} ${time}`
                            : placeholder}
                    </Text>
                    <Schedule />
                </Box>
            </DropButton>
        </Box>
    );
};
