export interface CookieOInterface<T extends { arr: (string | object)[] }> {
    baseName: string;
    extensionName: string;
    value: T;
    /**
     * this can change while using
     */
    setExtension: (e: string) => void;
    setCookie: (val: T) => void;
    getCookie: () => T;
}
