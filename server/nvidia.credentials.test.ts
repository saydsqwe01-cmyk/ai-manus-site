import { describe, expect, it } from "vitest";

describe("NVIDIA credentials", () => {
  it("can access the lightweight models endpoint", async () => {
    const apiKey = process.env.NVIDIA_API_KEY;
    expect(apiKey, "NVIDIA_API_KEY must be configured").toBeTruthy();
    const response = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(response.ok).toBe(true);
  }, 20_000);
});
