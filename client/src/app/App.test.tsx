import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

beforeEach(() => {
  window.history.replaceState({}, "", "/?preview=1#home");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("Unexpected API request in preview"))),
  );
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("archive preview", () => {
  it("navigates from dashboard to collection and filters by folder, tag, and search", async () => {
    const user = renderApp();
    expect(
      screen.getByRole("heading", { name: "A space for what stays." }),
    ).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "Cinema" }));
    await screen.findByRole("heading", { name: "Cinema" });
    expect(screen.getAllByRole("img")).toHaveLength(8);
    await user.click(screen.getByRole("button", { name: /Night studies 5/ }));
    expect(screen.getAllByRole("img")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "#neon" }));
    expect(screen.getAllByRole("img")).toHaveLength(2);
    await user.type(screen.getByLabelText("Search Cinema"), "Fallen");
    expect(screen.getAllByRole("img")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Fallen Angels/ }));
    await screen.findByRole("heading", { name: "Fallen Angels" });
    expect(screen.getByText("Kept for a reason.")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates an item with metadata and allows editing it", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "+ Save item" }));
    await screen.findByRole("heading", { name: "Keep something." });
    expect(
      (screen.getByRole("button", { name: "Save item" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await user.type(screen.getByLabelText("Title"), "A small discovery");
    await user.type(
      screen.getByLabelText(/Description/),
      "Worth returning to.",
    );
    await user.type(
      screen.getByLabelText(/Source URL/),
      "https://example.com/discovery",
    );
    await user.selectOptions(screen.getByLabelText("Folder"), "1");
    await user.selectOptions(screen.getByLabelText("Category"), "1");
    await user.click(screen.getByRole("button", { name: "#solitude" }));
    await user.click(screen.getByRole("button", { name: "Save item" }));
    await screen.findByRole("heading", { name: "A small discovery" });
    expect(screen.getByText("Worth returning to.")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open source ↗" }).getAttribute("href"),
    ).toBe("https://example.com/discovery");
    expect(screen.getByText("#solitude")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Edit item" }));
    await screen.findByRole("heading", { name: "Keep the details." });
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "An edited discovery");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByRole("heading", { name: "An edited discovery" });
    expect(screen.getByText("Worth returning to.")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a vault and folder and exposes the folder in the item form", async () => {
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "+ New vault" }));
    await user.type(screen.getByLabelText("Name"), "Reading");
    await user.click(screen.getByRole("button", { name: "Create vault" }));
    await screen.findByRole("heading", { name: "Reading" });
    await user.click(screen.getByRole("button", { name: "+ New folder" }));
    await user.type(screen.getByLabelText("Name"), "Essays");
    await user.click(screen.getByRole("button", { name: "Create folder" }));
    await screen.findByRole("button", { name: "Essays 0" });
    await user.click(
      screen.getByRole("button", { name: "+ Save your first item" }),
    );
    await screen.findByRole("heading", { name: "Keep something." });
    expect(screen.getByRole("option", { name: "Essays" })).toBeTruthy();
    expect((screen.getByLabelText("Vault") as HTMLInputElement).value).toBe(
      "Reading",
    );
  });

  it("requires explicit confirmation to remove an item", async () => {
    window.history.replaceState({}, "", "/?preview=1#item/1");
    const user = renderApp();
    await user.click(screen.getByRole("button", { name: "Remove from vault" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Keep item" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("heading", { name: "Fallen Angels" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Remove from vault" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Remove item",
      }),
    );
    await screen.findByRole("heading", { name: "Cinema" });
    expect(screen.queryByRole("button", { name: /Fallen Angels/ })).toBeNull();
    expect(screen.getAllByRole("img")).toHaveLength(7);
  });

  it("supports mobile menu state and global empty search", async () => {
    const user = renderApp();
    const menu = screen.getByRole("button", { name: "Menu" });
    await user.click(menu);
    expect(menu.getAttribute("aria-expanded")).toBe("true");
    await user.click(screen.getByRole("link", { name: "Sound" }));
    await screen.findByRole("heading", { name: "Sound" });
    expect(menu.getAttribute("aria-expanded")).toBe("false");
    await user.type(
      screen.getByLabelText("Search your archive"),
      "no-matching-items",
    );
    await waitFor(() =>
      expect(screen.getByText("Nothing quite matches.")).toBeTruthy(),
    );
  });
});
