import { Utils } from 'src/app/utils/utils';

describe('Utils', () => {
  it('should properly remove all whitespace and line breaks', () => {
    const testEntries = [
        {
            input: `{
            "expiration": "2013-02-08T14:30:26.000Z",
            "expired": false,
            "expiresIn": 3
            }`,
            expected: `{"expiration":"2013-02-08T14:30:26.000Z","expired":false,"expiresIn":3}`
        }
    ];

    testEntries.forEach(testEntry => expect(Utils.RemoveWhitespaceAndLineBreak(testEntry.input)).toBe(testEntry.expected));
  });
});
