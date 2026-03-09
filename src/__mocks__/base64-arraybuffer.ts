/** Stub for base64-arraybuffer in Jest */
export const decode = jest.fn().mockReturnValue(new ArrayBuffer(8));
export const encode = jest.fn().mockReturnValue('base64string');
