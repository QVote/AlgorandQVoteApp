import { FunctionComponent } from "react";
import { useMainContext } from "../hooks/useMainContext";
import { Loader } from "./Loader";
import { Box } from "grommet";
import { QParagraph } from "./QParagraph";

export function AddressGet(
    Comp: FunctionComponent<{ main: ReturnType<typeof useMainContext> }>,
    hook: "useContracts" | "useQueues"
) {
    const AddressGetComp = () => {
        const main = useMainContext();

        return main[hook].message != "" && main[hook].message != "def" ? (
            <Box fill flex="grow" align="center" justify="center">
                <QParagraph>{main[hook].message}</QParagraph>
            </Box>
        ) : !main[hook].loading ? (
            <Comp
                {...{
                    main,
                }}
            />
        ) : (
            <Loader />
        );
    };

    return AddressGetComp;
}
