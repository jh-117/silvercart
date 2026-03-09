/** Stub for expo-file-system/legacy in Jest (native module, not available in Node) */
export const readAsStringAsync = jest.fn().mockResolvedValue('base64encodedstring');
export const writeAsStringAsync = jest.fn().mockResolvedValue(undefined);
export const deleteAsync = jest.fn().mockResolvedValue(undefined);
export const getInfoAsync = jest.fn().mockResolvedValue({ exists: true, size: 1024 });
export const documentDirectory = '/mock/documents/';
export const cacheDirectory = '/mock/cache/';
