import { useState, useEffect } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5297/api/vaultitem?vaultId=1")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) return;

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("http://localhost:5297/api/vaultitem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          vaultId: 1,
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

export default App;
