import { useState, useEffect } from "react";

function Items({ vaultId }: { vaultId: number }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetch(`https://localhost:7213/api/vaultitem?vaultId=${vaultId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message));
  }, [vaultId]);

  if (error) return <p>Error: {error}</p>;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) return;

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("https://localhost:7213/api/vaultitem", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          vaultId: vaultId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Could not save item: ${response.status}`);
      }

      const createdItem = await response.json();

      setItems((previousItems) => [...previousItems, createdItem]);
      setTitle("");
      setDescription("");
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>My Vault Items</h1>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> — {item.description}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <button disabled={saving || !title.trim()} type="submit">
          {saving ? "Saving..." : "Add item"}
        </button>

        {saveError && <p role="alert">{saveError}</p>}
      </form>
    </div>
  );
}

export default Items;
