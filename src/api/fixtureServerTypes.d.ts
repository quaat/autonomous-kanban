declare module "*/scripts/fixture-server.mjs" {
  import type { Server } from "node:http";

  export function createFixtureServer(): Promise<Server>;
}

declare module "../../scripts/fixture-server.mjs" {
  import type { Server } from "node:http";

  export function createFixtureServer(): Promise<Server>;
}
