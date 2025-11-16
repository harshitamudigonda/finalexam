import React, { useEffect, useState } from "react";
import config from "./config";  // import config

export default function App() {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", quantity: 1 });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: "", quantity: 1 });

  // Load groceries from backend
  async function loadList(query = "") {
    setLoading(true);
    const url = query 
      ? `${config.url}/groceries?search=${query}` 
      : `${config.url}/groceries`;   // use config.url here
    const res = await fetch(url);
    const data = await res.json();
    setGroceries(data);
    setLoading(false);
  }

  useEffect(() => {
    loadList();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    loadList(value);
  };

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const res = await fetch(`${config.url}/groceries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newItem = await res.json();
    setGroceries((prev) => [...prev, newItem]);
    setForm({ name: "", quantity: 1 });
  }

  async function handleDelete(id) {
    await fetch(`${config.url}/groceries/${id}`, { method: "DELETE" });
    setGroceries((prev) => prev.filter((item) => item.id !== id));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingForm({ name: item.name, quantity: item.quantity });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    const res = await fetch(`${config.url}/groceries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingForm),
    });
    const updated = await res.json();
    setGroceries((prev) => prev.map((g) => (g.id === id ? updated : g)));
    setEditingId(null);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Your Grocery App</h1>
      </header>

      <main className="container">
        <section className="controls">
          <div>
            <label className="label">Search</label>
            <input
              value={search}
              onChange={handleSearch}
              className="input"
              placeholder="Search groceries..."
            />
          </div>

          <form onSubmit={handleAdd} className="add-form">
            <label className="label">Add grocery</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="Name"
            />
            <input
              type="number"
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
              className="input small"
              min="1"
            />
            <button className="btn">Add</button>
          </form>
        </section>

        <section className="list">
          <h2 className="section-title">Grocery list</h2>
          {loading ? <p>Loading...</p> : (
            <ul>
              {groceries.map(item => (
                <li key={item.id} className="item">
                  {editingId === item.id ? (
                    <>
                      <input
                        value={editingForm.name}
                        onChange={e => setEditingForm(f => ({ ...f, name: e.target.value }))}
                        className="input"
                      />
                      <input
                        type="number"
                        value={editingForm.quantity}
                        onChange={e => setEditingForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                        className="input small"
                        min="1"
                      />
                      <button className="btn" onClick={() => saveEdit(item.id)}>Save</button>
                      <button className="btn ghost" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <div className="item-actions">
                        <button className="btn ghost" onClick={() => startEdit(item)}>Edit</button>
                        <button className="btn danger" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

