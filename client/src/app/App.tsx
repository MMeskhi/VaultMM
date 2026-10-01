import { useState } from "react";
import { useSession } from "../features/auth/queries";
import { ArchiveWorkspace } from "../features/vault/components/ArchiveWorkspace";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { Status } from "../ui/Status";
import { API_URL } from "../lib/api";

export default function App() {
  const [preview, setPreview] = useState(
    new URLSearchParams(window.location.search).get("preview") === "1",
  );
  const session = useSession(!preview);
  if (preview || (!session.isPending && !session.isError && !session.data)) {
    return <ArchiveWorkspace key="preview" preview />;
  }
  if (session.data)
    return (
      <ArchiveWorkspace
        key={session.data.user.id}
        session={session.data}
        preview={false}
      />
    );
  return (
    <main className="welcome-screen">
      <Panel className="welcome-panel">
        <a className="brand" href="#home">
          <span className="brand__mark" />
          vaultmm
        </a>
        <p className="eyebrow">Your personal archive</p>
        <h1>A space for what stays.</h1>
        <p>Films, sounds, worlds, and small discoveries. All in one place.</p>
        {session.isError ? (
          <>
            <Status error>{session.error.message}</Status>
            <div className="form-actions">
              <Button
                variant="primary"
                onClick={() => void session.refetch()}
                disabled={session.isFetching}
              >
                Try again
              </Button>
              <Button onClick={() => setPreview(true)}>
                Explore design preview
              </Button>
            </div>
            <a className="account-link" href={`${API_URL}/api/auth/google`}>
              Sign in with Google ?
            </a>
          </>
        ) : (
          <Status>Opening your archive...</Status>
        )}
      </Panel>
    </main>
  );
}
