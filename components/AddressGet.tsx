import { FunctionComponent } from "react";
import { Loader } from "./Loader";
import { zilliqaApi } from "../helpers/Zilliqa";

export function AddressGet(
    Comp: FunctionComponent,
) {
    const AddressGetComp = () => {
        return !zilliqaApi.loading && zilliqaApi.contractState ? (
            <Comp />
        ) : (
            <Loader />
        );
    };

    return AddressGetComp;
}
