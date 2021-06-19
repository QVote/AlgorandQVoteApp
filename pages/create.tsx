import { useRef } from "react";
import { Box, TextInput, TextArea, Button, Keyboard, Text } from "grommet";
import { v4 as uuidv4 } from "uuid";
import { decisionValidate, getInitDecision, areUniqueOnKey } from "../scripts";
import { ScrollBox } from "../components/ScrollBox";
import { Clock, InProgress, Trash, Add } from "grommet-icons";
import { TwoCards } from "../components/TwoCards";
import { QHeading } from "../components/QHeading";
import { scrollTo } from "../scripts";
import { TransactionSubmitted } from "../components/TransactionSubmitted";
import { QParagraph } from "../components/QParagraph";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import { longNotification } from "../components/Notifications/LongNotification";
import { zilliqaApi } from "../helpers/Zilliqa";

class Creator {
    target = getInitDecision();
    tempOption = "";
    loading = false;
    nextCard = false;
    submitted = false;
    constructor() {
        makeAutoObservable(this);
    }
    setNextCard(b: boolean) {
        this.nextCard = b;
    }
    reset() {
        this.target = getInitDecision();
        this.tempOption = "";
        this.loading = false;
        this.nextCard = false;
        this.submitted = false;
    }
    get targetValid() {
        return decisionValidate(this.target);
    }
    setLoading(b: boolean) {
        this.loading = b;
    }
    get thereIsATempOptionAndRemainingValid() {
        return (
            this.tempOption != "" &&
            areUniqueOnKey(this.target.options, "optName")
        );
    }
    get isTempOptionValid() {
        return areUniqueOnKey(
            [
                ...this.target.options,
                {
                    optName: this.tempOption,
                    uid: "tempOP",
                },
            ],
            "optName"
        );
    }
    setTempOption(s: string) {
        this.tempOption = s;
    }

    setName(s: string) {
        this.target.name = s;
    }

    setDescription(s: string) {
        this.target.description = s;
    }
    /**
     * tries to add the temp option
     * clears the temp option
     */
    tryAddOption(): boolean {
        if (
            creator.thereIsATempOptionAndRemainingValid &&
            creator.isTempOptionValid
        ) {
            this.target.options.push({
                optName: this.tempOption,
                uid: uuidv4(),
            });
            this.setTempOption("");
            return true;
        }
        return false;
    }
    trySetRegisterTime(time: string) {
        const registerEndTime = parseInt(time);
        if (Number.isInteger(registerEndTime)) {
            if (registerEndTime >= 0) {
                this.target.registerEndTime = registerEndTime;
            }
        }
    }
    trySetEndTime(time: string) {
        const endTime = parseInt(time);
        if (Number.isInteger(endTime)) {
            if (endTime > 0) {
                this.target.endTime = endTime;
            }
        }
    }
    deleteOption(uid: string) {
        this.target.options = this.target.options.filter((x) => x.uid != uid);
    }
    setSubmitted(b: boolean) {
        this.submitted = b;
    }
}
const creator = new Creator();

const DecisionCreator = observer(() => {
    const lastOption = useRef(null);

    function onAddNewOption() {
        if (creator.tryAddOption()) {
            scrollTo(lastOption);
        }
    }

    async function onTryToDeploy() {
        if (!creator.loading && creator.targetValid.isValid) {
            creator.setLoading(true);
            try {
                await onDeploy();
            } catch (e) {
                longNotification.showNotification(
                    "Something went wrong!",
                    "error"
                );
            }
            creator.setLoading(false);
        }
    }

    async function onDeploy() {
        await zilliqaApi.deploy(creator.target);
        creator.setSubmitted(true);
    }

    return creator.submitted ? (
        <TransactionSubmitted
            onClick={() => creator.reset()}
            txt="Create another?"
            buttonLabel="Go to create"
        />
    ) : !creator.nextCard ? (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Details"}</QHeading>
                    <Box fill gap="small">
                        <TextInput
                            placeholder="Name"
                            size="small"
                            value={creator.target.name}
                            maxLength={100}
                            onChange={(e) => creator.setName(e.target.value)}
                        />
                        <TextArea
                            resize={false}
                            fill
                            placeholder="Details"
                            size="small"
                            value={creator.target.description}
                            maxLength={100}
                            onChange={(e) =>
                                creator.setDescription(e.target.value)
                            }
                        />
                    </Box>
                </Box>
            }
            Card2={
                <Box fill>
                    <QHeading>{"Options"}</QHeading>
                    <Box
                        direction="row"
                        margin={{ bottom: "small" }}
                        height={{ min: "xxsmall" }}
                    >
                        <Keyboard onEnter={onAddNewOption}>
                            <Box fill direction="row" gap="small">
                                <Box fill>
                                    <TextInput
                                        placeholder="Option Name"
                                        size="small"
                                        value={creator.tempOption}
                                        onChange={(e) => {
                                            creator.setTempOption(
                                                e.target.value
                                            );
                                        }}
                                        maxLength={26}
                                    />
                                </Box>
                                <Box
                                    align="center"
                                    justify="center"
                                    height="xxsmall"
                                >
                                    <Button
                                        icon={<Add />}
                                        disabled={!creator.isTempOptionValid}
                                        onClick={onAddNewOption}
                                    />
                                </Box>
                            </Box>
                        </Keyboard>
                    </Box>
                    <ScrollBox props={{ gap: "small" }}>
                        {creator.target.options.map((o, i) => {
                            return (
                                <Box
                                    height={{ min: "50px" }}
                                    justify="center"
                                    key={`option${o.optName}`}
                                    ref={lastOption}
                                    margin={{ bottom: "small" }}
                                    pad={{ left: "small" }}
                                    background="white"
                                    round="xsmall"
                                    direction="row"
                                >
                                    <Box fill justify="center">
                                        <Text truncate size="small">
                                            {`${i + 1}. ${o.optName}`}
                                        </Text>
                                    </Box>
                                    <Box align="center" justify="center">
                                        <Button
                                            onClick={() =>
                                                creator.deleteOption(o.uid)
                                            }
                                            icon={<Trash />}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                    </ScrollBox>
                </Box>
            }
            NextButton={
                <Box fill direction="row">
                    <Box
                        justify="center"
                        align="center"
                        pad={{ left: "small" }}
                        fill
                    ></Box>
                    <Box align="center" justify="center" fill pad="small">
                        <Button
                            disabled={
                                !(
                                    creator.targetValid.nameValid &&
                                    creator.targetValid.descriptionValid &&
                                    creator.targetValid.optionsValid
                                )
                            }
                            label={"Next"}
                            onClick={() => creator.setNextCard(true)}
                        />
                    </Box>
                </Box>
            }
        />
    ) : (
        <TwoCards
            Card1={
                <Box fill>
                    <QHeading>{"Time"}</QHeading>
                    <Box fill gap="small">
                        <Text>Registration open:</Text>
                        <TextInput
                            icon={<Clock />}
                            placeholder="Minutes for registration"
                            size="small"
                            type="number"
                            value={creator.target.registerEndTime}
                            onChange={(e) =>
                                creator.trySetRegisterTime(e.target.value)
                            }
                        />
                        <Text>Voting open after registration:</Text>
                        <TextInput
                            icon={<InProgress />}
                            placeholder="Minutes voting is open after registration"
                            size="small"
                            type="number"
                            value={creator.target.endTime}
                            onChange={(e) =>
                                creator.trySetEndTime(e.target.value)
                            }
                        />
                    </Box>
                </Box>
            }
            Card2={
                <Box fill gap="small">
                    <QHeading>{"Tokens"}</QHeading>
                    <QParagraph>
                        Token ownership snapshot (coming soon)
                    </QParagraph>
                </Box>
            }
            NextButton={
                <Box fill direction="row">
                    <Box
                        justify="center"
                        align="center"
                        pad={{ left: "small" }}
                        fill
                    >
                        <Button
                            disabled={false}
                            secondary
                            label={"Go Back"}
                            onClick={() => creator.setNextCard(false)}
                        />
                    </Box>
                    <Box align="center" justify="center" fill pad="small">
                        <Button
                            disabled={
                                creator.loading || !creator.targetValid.isValid
                            }
                            label={
                                creator.loading
                                    ? "Waiting for confirmation"
                                    : "Deploy to zilliqa"
                            }
                            onClick={() => onTryToDeploy()}
                        />
                    </Box>
                </Box>
            }
        />
    );
});

export default DecisionCreator;
