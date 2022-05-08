import { IPeer } from "../../../src/peer-discovery";

export const dummyGithubSeeds: IPeer[] = [
	{
		ip: "1.1.1.1",
		port: 4001,
	},
	{
		ip: "2.2.2.2",
		port: 4001,
	},
];

export const dummyPeers = [
	{
		ip: "1.1.1.1",
		port: 4000,
		ports: {
			"@cauriland/core-api": 4003,
			"@cauriland/core-webhooks": -1,
		},
		version: "3.0.0-alpha.9",
		height: 1034402,
		latency: 200,
		plugins: {
			"@cauriland/core-api": {
				enabled: true,
				port: 4003,
				estimateTotalCount: true,
			},
			"@cauriland/core-webhooks": {
				enabled: true,
				port: -1,
			},
		},
	},
	{
		ip: "2.2.2.2",
		port: 4000,
		ports: {
			"@cauriland/core-api": 4003,
			"@cauriland/core-webhooks": -1,
		},
		version: "3.0.0-alpha.10",
		height: 1034402,
		latency: 150,
		plugins: {
			"@cauriland/core-api": {
				enabled: true,
				port: 4003,
				estimateTotalCount: true,
			},
			"@cauriland/core-webhooks": {
				enabled: true,
				port: -1,
			},
		},
	},
];
