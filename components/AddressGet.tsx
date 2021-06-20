import { FunctionComponent } from "react";
import { Loader } from "./Loader";
import { blockchain } from "../helpers/Blockchain";

export function AddressGet(Comp: FunctionComponent) {
    const AddressGetComp = () => {
        return !blockchain.loading && blockchain.contractState ? (
            <Comp />
        ) : (
            <Loader />
        );
    };

    return AddressGetComp;
}
