import Cookie from "js-cookie";
import { makeAutoObservable } from "mobx";
import { CookieOInterface } from "../../types";

export class CookieObjectInterface<T extends { arr: (string | object)[] }>
    implements CookieOInterface<T>
{
    baseName: string;
    extensionName: string;
    value: T = { arr: [] } as T;

    constructor(baseName: string, extension: string) {
        this.baseName = baseName;
        this.extensionName = extension;
        this.value = this.getCookie();
        makeAutoObservable(this);
    }

    private getCookieName() {
        return this.baseName + this.extensionName;
    }

    /**
     * this can change while using
     */
    setExtension(e: string) {
        this.extensionName = e;
        this.setCookie(this.getCookie());
    }

    setCookie(val: T) {
        Cookie.set(this.getCookieName(), val, { path: "/" });
        this.value = val;
    }

    getCookie(): T {
        return Cookie.getJSON(this.getCookieName()) || this.value;
    }
}
