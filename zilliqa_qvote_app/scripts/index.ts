import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers'


function concatStrings(name: string, desc: string) {
    const mark = uuidv4().substr(0, 6);
    return `${mark}_${name}${mark}${desc}`
}

function unConcatStrings(concat: string) {
    const markIndex = concat.indexOf("_");
    const mark = concat.substr(0, markIndex);
    const splitted = concat.split(mark);
    const nameWithUnderscore = splitted[1];
    const name = nameWithUnderscore.substring(1, nameWithUnderscore.length);
    return [name, splitted[2]]
}

function makeStringUniq(s: string) {
    const mark = uuidv4().substr(0, 5);
    return `${mark}_${s}`
}

function uniqStringToString(concat: string) {
    const markIndex = concat.indexOf("_");
    const mark = concat.substr(0, markIndex + 1);
    const splitted = concat.split(mark);
    return [mark, splitted[1]]
}

function getNumberFromBigNum(n: ethers.BigNumber) {
    return parseInt(ethers.BigNumber.from(n).toString())
}

export { concatStrings, unConcatStrings, makeStringUniq, uniqStringToString, getNumberFromBigNum }