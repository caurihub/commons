import { CauriHubConnection } from "../../../../src";
import { mockAssets } from "./assets";
import { mockBurns } from "./burns";
import { mockCollections } from "./collections";
import { mockBaseConfigurations } from "./configurations";
import { mockTransfers } from "./transfers";

export const configureBaseMocks = <T>(resource): T => {
	const host = "https://example.net:4003/api";

	mockAssets(host);
	mockBurns(host);
	mockBaseConfigurations(host);
	mockCollections(host);
	mockTransfers(host);

	return new resource(new CauriHubConnection(host));
};
