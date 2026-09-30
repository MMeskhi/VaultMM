import "./App.css";
import { useEffect, useState } from "react";
import Items from "./components/items";

const API_URL = "https://localhost:7213";

type CurrentUser = {
  id: number;
  email: string;
  displayName: string | null;
};

type Vault = {
  id: number;
  name: string;
};

function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (userResponse.status === 401) return;

        if (!userResponse.ok) {
          throw new Error(`Could not load user: ${userResponse.status}`);
        }

        const currentUser: CurrentUser = await userResponse.json();

        const vaultResponse = await fetch(`${API_URL}/api/vault/mine`, {
          method: "POST",
          credentials: "include",
        });

        if (vaultResponse.status === 401) return;

        if (!vaultResponse.ok) {
          throw new Error(`Could not load vault: ${vaultResponse.status}`);
        }

        const currentVault: Vault = await vaultResponse.json();

        if (active) {
          setUser(currentUser);
          setVault(currentVault);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error ? error.message : "Could not load session",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // An expired session is already logged out.
      if (!response.ok && response.status !== 401) {
        throw new Error(`Could not log out: ${response.status}`);
      }

      setUser(null);
      setVault(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not log out");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <section className="p-4 md:p-8">
      <h1 className="text-4xl text-white">VaultMM</h1>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : user && vault ? (
        <>
          <div className="my-4 flex items-center gap-4">
            <p>Signed in as {user.displayName || user.email}</p>

            <button type="button" onClick={logout} disabled={loggingOut}>
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>

          <Items key={vault.id} vaultId={vault.id} />
        </>
      ) : (
        <a href={`${API_URL}/api/auth/google`}>Sign in with Google</a>
      )}
    </section>
  );
}

export default App;
