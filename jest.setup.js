import '@testing-library/jest-native/extend-expect';

// Silence unnecessary warnings
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
