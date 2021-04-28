import { FunctionComponent } from "react";
import { useMainContext } from "../hooks/useMainContext";
import { Loader } from "./Loader";
import { Box } from "grommet";
import { QParagraph } from "./QParagraph";

export function AddressGet(
    Comp: FunctionComponent<{ main: ReturnType<typeof useMainContext> }>
) {
    const AddressGetComp = () => {
        const main = useMainContext();

        return !main.useContracts.loading ? (
            main.useContracts.message != "" &&
            main.useContracts.message != "def" ? (
                <Box fill flex="grow" align="center" justify="center">
                    <QParagraph>{main.useContracts.message}</QParagraph>
                </Box>
            ) : (
                <Comp
                    {...{
                        main,
                    }}
                />
            )
        ) : (
            <Loader />
        );
    };

    return AddressGetComp;
}
