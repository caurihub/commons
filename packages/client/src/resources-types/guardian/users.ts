import { ApiQuery } from "@cauriland/client";

import { Permission } from "./groups";

export interface User {
	publicKey: string;
	groups: string[];
	allow: Permission[];
	deny: Permission[];
}

export interface AllUsersQuery extends ApiQuery {
	publicKey?: string;
}
