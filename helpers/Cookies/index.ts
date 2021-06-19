import Cookie from "js-cookie";
import { makeAutoObservable } from "mobx";

export class CookieObjectInterface<T extends { arr: (string | object)[] }> {
    baseName: string;
    extensionName: string;
    value = { arr: [] };

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
