import { PeerDiscovery } from "./peer-discovery";
import { CauriHubConnection } from "./caurihub-connection";

export class ConnectionManager {
	private readonly defaultConnection: CauriHubConnection;
	private readonly caurihubConnections: CauriHubConnection[] = [];

	public constructor(defaultConnection: CauriHubConnection) {
		this.defaultConnection = defaultConnection;
	}

	public async findRandomPeers(): Promise<ConnectionManager> {
		const peers = await (await PeerDiscovery.new(this.defaultConnection)).findPeers();
		for (const peer of peers) {
			const coreApi = peer.plugins["@cauriland/core-api"];
			if (coreApi) {
				this.caurihubConnections.push(new CauriHubConnection(`http://${peer.ip}:${coreApi.port}/api`));
			}
		}
		return Promise.resolve(this);
	}

	public getRandomConnection(): CauriHubConnection | undefined {
		return this.caurihubConnections[Math.floor(Math.random() * this.caurihubConnections.length)];
	}

	public getDefaultConnection(): CauriHubConnection {
		return this.defaultConnection;
	}
}
