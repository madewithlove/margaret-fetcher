export default function jsonParser(string) {
    try {
        return JSON.parse(string);
    } catch (error) {
        return string;
    }
}
