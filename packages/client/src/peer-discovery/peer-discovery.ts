import { Connection } from "@cauriland/client";
import isUrl from "is-url-superb";
import ky from "ky-universal";
import orderBy from "lodash.orderby";
import semver from "semver";

import { IPeer, IPeerResponse } from "./interfaces";

export class PeerDiscovery {
	private version: string | undefined;
	private latency: number | undefined;
	private orderBy: string[] = ["latency", "desc"];

	private constructor(private readonly seeds: IPeer[]) {}

	public static async new(
		connection?: Connection,
		networkOrUrl?: "mainnet" | "devnet" | string,
	): Promise<PeerDiscovery> {
		let seeds: IPeer[] = [];

		if (typeof networkOrUrl === "string") {
			if (networkOrUrl === "mainnet" || networkOrUrl === "devnet") {
				try {
					seeds = await ky
						.get(`https://raw.githubusercontent.com/cauriland/peers/main/${networkOrUrl}.json`)
						.json<IPeer[]>();
				} catch {
					throw new Error("Failed to discovery any peers.");
				}
			} else {
				if (isUrl(networkOrUrl)) {
					try {
						seeds = (await ky.get(networkOrUrl).json<{ data: IPeer[] }>()).data;
					} catch {
						throw new Error("Failed to discovery any peers.");
					}
				} else {
					throw new Error("Failed to discovery any peers, because the url is wrong");
				}
			}
		} else {
			if (connection) {
				try {
					seeds = (await connection.get<{ data: IPeer[] }>("peers")).body.data;
				} catch {
					throw new Error("Failed to discovery any peers.");
				}
			} else {
				throw new Error("No connection, network or url specified");
			}
		}

		if (!seeds.length) {
			throw new Error("No seeds found");
		}

		return new PeerDiscovery(seeds);
	}

	public getSeeds(): IPeer[] {
		return this.seeds;
	}

	public withVersion(version: string): PeerDiscovery {
		this.version = version;

		return this;
	}

	public withLatency(latency: number): PeerDiscovery {
		this.latency = latency;

		return this;
	}

	public sortBy(key: string, direction = "desc"): PeerDiscovery {
		this.orderBy = [key, direction];

		return this;
	}

	public async findPeers(opts: any = {}): Promise<IPeerResponse[]> {
		if (!opts.retry) {
			opts.retry = { limit: 0 };
		}

		if (!opts.timeout) {
			opts.timeout = 3000;
		}

		const selectProperPeer = (): IPeer => {
			const peer = this.seeds[Math.floor(Math.random() * this.seeds.length)];
			if (peer?.plugins) {
				const coreApiPlugin = peer.plugins["@cauriland/core-api"];
				if (!coreApiPlugin) {
					return selectProperPeer();
				}
				if (coreApiPlugin.port) {
					return peer;
				}
				return selectProperPeer();
			}
			return selectProperPeer();
		};

		const seed: IPeer = selectProperPeer();

		const body: any = await ky(`http://${seed.ip}:${seed.plugins["@cauriland/core-api"].port}/api/peers`, {
			...opts,
			...{
				headers: {
					"Content-Type": "application/json",
				},
			},
		}).json();

		let peers: IPeerResponse[] = body.data;

		if (this.version) {
			peers = peers.filter((peer: IPeerResponse) => semver.satisfies(peer.version, this.version!));
		}

		if (this.latency) {
			peers = peers.filter((peer: IPeerResponse) => peer.latency <= this.latency!);
		}

		return orderBy(peers, this.orderBy[0], this.orderBy[1] as any);
	}

	public async findPeersWithPlugin(name: string, opts: { additional?: string[] } = {}): Promise<IPeer[]> {
		const peers: IPeer[] = [];

		for (const peer of await this.findPeers(opts)) {
			if (peer.plugins) {
				const pluginName: string | undefined = Object.keys(peer.plugins).find(
					(key: string) => key.split("/")[1] === name,
				);

				if (pluginName) {
					const port: number = peer.plugins[pluginName].port;

					if (port >= 1 && port <= 65535) {
						peers.push(peer);
					}
				}
			}
		}

		return peers;
	}

	public async findPeersWithoutEstimates(opts: { additional?: string[] } = {}): Promise<IPeer[]> {
		const apiPeers: IPeer[] = await this.findPeersWithPlugin("core-api", opts);

		const requests = apiPeers.map((peer) => {
			return ky.get(`http://${peer.ip}:${peer.plugins["@cauriland/core-api"].port}/api/blocks?limit=1`).json();
		});

		const responses = await Promise.all(requests);
		const peers: IPeer[] = [];

		for (const i in responses) {
			const apiPeer = apiPeers[i];
			if (!(responses[i] as any).meta.totalCountIsEstimate && apiPeer) {
				peers.push(apiPeer);
			}
		}

		return peers;
	}
}
