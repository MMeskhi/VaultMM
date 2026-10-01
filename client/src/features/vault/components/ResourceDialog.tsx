import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../ui/Button";
import { Dialog } from "../../../ui/Dialog";
import { Input } from "../../../ui/Field";
import { Status } from "../../../ui/Status";
import type { Archive } from "../useArchive";

export function ResourceDialog({
  kind,
  vaultId,
  archive,
  onClose,
  onCreated,
}: {
  kind: "vault" | "folder" | "category" | "tag";
  vaultId: number;
  archive: Archive;
  onClose: () => void;
  onCreated?: (id: number) => void;
}) {
  const [name, setName] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || archive.addResource.isPending) return;
    archive.addResource.mutate(
      { kind, vaultId, name: name.trim() },
      {
        onSuccess: (resource) => {
          onClose();
          onCreated?.(resource.id);
        },
      },
    );
  }
  return (
    <Dialog
      title={`A new ${kind}.`}
      onClose={() => {
        if (!archive.addResource.isPending) onClose();
      }}
    >
      <p>Give your discoveries a little more room.</p>
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          placeholder={
            kind === "vault"
              ? "Cinema, Sound, Collected..."
              : `Name your ${kind}`
          }
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={100}
          autoFocus
          disabled={archive.addResource.isPending}
        />
        {archive.addResource.error && (
          <Status error>{archive.addResource.error.message}</Status>
        )}
        <div className="dialog__actions">
          <Button onClick={onClose} disabled={archive.addResource.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || archive.addResource.isPending}
          >
            {archive.addResource.isPending ? "Creating..." : `Create ${kind}`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
