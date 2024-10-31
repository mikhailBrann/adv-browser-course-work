export default class Validate {
    static isLink(value) {
        const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
        return regex.test(value);
    }
}