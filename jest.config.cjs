// jest.config.js
module.exports = {
	transform: {
		'^.+\\.svelte$': 'svelte-jester',
		'^.+\\.js$': 'babel-jest',
		'^.+\\.ts$': 'ts-jest'
	},
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	testPathIgnorePatterns: ['node_modules'],
	setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	}
};
