import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../lib/api";
import { getSession, logout } from "../auth/api";
import { createVaultItem, getVaultItems, updateVaultItem } from "./api";

afterEach(() => vi.unstubAllGlobals());
function mockResponses(...responses: { status: number; body?: unknown }[]) {
  const fetchMock = vi.fn();
  for (const response of responses)
    fetchMock.mockResolvedValueOnce(
      new Response(
        response.status === 204 ? null : JSON.stringify(response.body),
        { status: response.status },
      ),
    );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
describe("archive API", () => {
  it("does not create a vault for a signed-out user", async () => {
    const fetchMock = mockResponses({ status: 401 });
    expect(await getSession()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("loads the user before the vault and forwards cookies and cancellation", async () => {
    const fetchMock = mockResponses(
      { status: 200, body: { id: 1 } },
      { status: 200, body: { id: 2 } },
    );
    const controller = new AbortController();
    expect((await getSession(controller.signal))?.vault.id).toBe(2);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      credentials: "include",
      method: "POST",
      signal: controller.signal,
    });
  });
  it("treats an expired logout as success but preserves server errors", async () => {
    mockResponses({ status: 401 });
    await expect(logout()).resolves.toBeUndefined();
    mockResponses({ status: 500 });
    await expect(logout()).rejects.toBeInstanceOf(ApiError);
  });
  it("sends all item metadata and adapts tag IDs for updates", async () => {
    const input = {
      vaultId: 2,
      title: "Saved",
      description: "A note",
      url: "https://example.com",
      imageUrl: null,
      folderId: 3,
      categoryId: 4,
      tagIds: [5],
    };
    const fetchMock = mockResponses(
      { status: 201, body: { id: 7 } },
      { status: 204 },
    );
    expect((await createVaultItem(input)).id).toBe(7);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(input);
    await updateVaultItem(7, input);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      id: 7,
      tags: [{ id: 5, name: "" }],
    });
  });
  it("keys requests by the supplied vault and surfaces loading failures", async () => {
    const fetchMock = mockResponses({ status: 200, body: [] }, { status: 403 });
    expect(await getVaultItems(12)).toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toContain("vaultId=12");
    await expect(getVaultItems(12)).rejects.toMatchObject({ status: 403 });
  });
});
