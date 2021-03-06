import "jest-extended";

import { CauriHubConnection } from "../../src";
import { Groups } from "../../src/resources/guardian/groups";
import { Collections } from "../../src/resources/nft/base/collections";
import { Auctions } from "../../src/resources/nft/exchange/auctions";

const url = "http://127.0.0.1";

describe("Connections tests", () => {
	describe("NFTConnection test", () => {
		it("should get Collections instance from NFTConnection", () => {
			const conn = new CauriHubConnection(url);
			const collections = conn.NFTBaseApi("collections");

			expect(collections).toBeInstanceOf(Collections);
		});

		it("should get Auctions instance from NFTConnection", () => {
			const conn = new CauriHubConnection(url);
			const auctions = conn.NFTExchangeApi("auctions");

			expect(auctions).toBeInstanceOf(Auctions);
		});
	});

	describe("GuardianConnection test", () => {
		it("should get Groups instance from GuardianConnection", () => {
			const conn = new CauriHubConnection(url);
			const groups = conn.guardianApi("groups");

			expect(groups).toBeInstanceOf(Groups);
		});
	});
});
