import { ABase } from "@common/airtableResource";
import { ClientSideSocket } from "./framework";

export const errors = {
  "not-initialized": Error(
    "The base is not initialized. Please call sync(...) function first."
  ),
} as const;

export class AireTableClient {
  readonly #address = "http://0.0.0.0:3434";
  readonly #client;
  readonly #authToken;
  #base: ABase | null = null;
  constructor(airtableAuthToken: string) {
    this.#client = new ClientSideSocket(this.#address, {});
    this.#authToken = airtableAuthToken;
  }
  async startSync(airtableBaseId: string) {
    await this.#client.connect();
    this.#base = await this.#client.sendRequest<
      { authToken: string; baseId: string },
      ABase
    >("sync-base-req", {
      authToken: this.#authToken,
      baseId: airtableBaseId,
    });
  }
  async stopSync() {
    await this.#client.disconnect();
  }
  get base() {
    if (this.#base) return this.#base;
    else throw errors["not-initialized"];
  }
}

(async () => {
  const c = new AireTableClient(
    "patvVIhW6YcAMw0cE.68a8a732bc788a931157e9e257bd72513628b94048e9572bc523ad12a91c50f0"
  );
  try {
    await c.startSync("appouDX1EZyEize94");
    console.log(c.base);
  } catch (err) {
    console.error(err);
  } finally {
    console.debug("Done.");
    // await c.stopSync();
  }
})();
