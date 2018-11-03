export class Utils {
    public static RemoveWhitespaceAndLineBreak(input: string): string {
        // https://stackoverflow.com/questions/22921242/remove-carriage-return-and-space-from-a-string
        return input.replace(/\s+/g, '');
    }
}
