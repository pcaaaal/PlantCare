// jest.config.js - simplified
module.exports = {
	preset: 'jest-expo',
	testEnvironment: 'node',
	transformIgnorePatterns: [
		'node_modules/(?!(jest-)?react-native|@react-native|expo|expo-notifications|expo-modules-core)',
	],
	setupFilesAfterEnv: ['./jest.setup.js'],
};
