export default {
	preset: "solid-jest/preset/browser",
	setupFilesAfterEnv: ["<rootDir>/node_modules/@testing-library/jest-dom"],
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	transform: {
		"^.+\\.(t|j)sx?$": [
			"babel-jest",
			{
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								node: "current",
							},
						},
					],
					"@babel/preset-typescript",
					"babel-preset-solid",
					[
						"babel-preset-vite",
						{
						  "env": true,
						  "glob": false
						}
					]
				],
			},
		],
	},
	testEnvironment: "jsdom",
	moduleNameMapper: {
		"^~/(.*)$": "<rootDir>/src/$1",
		"^solid-js$": "solid-js/dist/solid.cjs",
		"^solid-js/web$": "solid-js/web/dist/web.cjs",
	},
};
