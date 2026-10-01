import { useEffect, useState } from "react";

export type ArchiveRoute =
  | { page: "dashboard" }
  | { page: "recent" }
  | { page: "collection" | "create"; vaultId: number }
  | { page: "detail" | "edit"; itemId: number };

function readRoute(): ArchiveRoute {
  const parts = window.location.hash.slice(1).split("/");
  const id = Number(parts[1]);
  if (parts[0] === "recent") return { page: "recent" };
  if (parts[0] === "vault" && id > 0)
    return { page: parts[2] === "new" ? "create" : "collection", vaultId: id };
  if (parts[0] === "item" && id > 0)
    return { page: parts[2] === "edit" ? "edit" : "detail", itemId: id };
  return { page: "dashboard" };
}

export function useArchiveRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const handleChange = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handleChange);
    return () => window.removeEventListener("hashchange", handleChange);
  }, []);
  return route;
}

export function navigate(route: ArchiveRoute) {
  const hash =
    route.page === "dashboard"
      ? "home"
      : route.page === "recent"
        ? "recent"
        : "vaultId" in route
          ? `vault/${route.vaultId}${route.page === "create" ? "/new" : ""}`
          : `item/${route.itemId}${route.page === "edit" ? "/edit" : ""}`;
  window.location.hash = hash;
}
