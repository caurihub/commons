import { ApiResponse, Resource } from "@cauriland/client";

import { BaseConfigurations as ConfigurationsResource } from "../../../resources-types/nft/base";

export class Configurations extends Resource {
	public async index(): Promise<ApiResponse<ConfigurationsResource>> {
		return this.sendGet("nft/configurations");
	}
}
