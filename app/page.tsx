"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
};

const STORAGE_KEY = "user-management-users";

function parseAge(value: string): number | null {
  const parsedAge = Number.parseInt(value, 10);

  if (Number.isNaN(parsedAge) || parsedAge <= 0) {
    return null;
  }

  return parsedAge;
}

function isStoredUser(value: unknown): value is User {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<User>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.age === "number" &&
    typeof candidate.isActive === "boolean"
  );
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY);

      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers) as unknown;

        if (Array.isArray(parsedUsers)) {
          setUsers(parsedUsers.filter(isStoredUser));
        }
      }
    } catch {
      // Ignore malformed localStorage values and continue with empty state.
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Ignore write errors (e.g. private mode quota restrictions).
    }
  }, [hasLoadedFromStorage, users]);

  const handleAddUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedAge = parseAge(age);

    if (!trimmedName || parsedAge === null) {
      return;
    }

    const nextUser: User = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: trimmedName,
      age: parsedAge,
      isActive: true,
    };

    setUsers((previousUsers) => [nextUser, ...previousUsers]);
    setName("");
    setAge("");
  };

  const handleToggleStatus = (userId: number) => {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user,
      ),
    );
  };

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditAge(String(user.age));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditAge("");
  };

  const saveUser = (userId: number) => {
    const trimmedName = editName.trim();
    const parsedAge = parseAge(editAge);

    if (!trimmedName || parsedAge === null) {
      return;
    }

    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              name: trimmedName,
              age: parsedAge,
            }
          : user,
      ),
    );

    cancelEditing();
  };

  return (
    <div className="user-page">
      <main className="user-shell">
        <h1 className="user-title">User Management</h1>

        <form className="user-form" onSubmit={handleAddUser}>
          <input
            type="text"
            className="text-input"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            type="number"
            className="age-input"
            placeholder="Age"
            min={1}
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
          <button type="submit" className="primary-btn">
            Add
          </button>
        </form>

        <section className="user-list">
          {users.length === 0 ? (
            <p className="empty-state">No users yet. Add one to get started.</p>
          ) : (
            users.map((user) => (
              <article key={user.id} className="user-card">
                <div className="user-card-top">
                  {editingId === user.id ? (
                    <div className="edit-grid">
                      <input
                        type="text"
                        className="text-input"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                      />
                      <input
                        type="number"
                        className="age-input"
                        min={1}
                        value={editAge}
                        onChange={(event) => setEditAge(event.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="user-name">{user.name}</h2>
                      <p className="user-age">Age: {user.age}</p>
                    </div>
                  )}

                  <span
                    className={`status-badge ${user.isActive ? "active" : "inactive"}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="user-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    Toggle Status
                  </button>

                  {editingId === user.id ? (
                    <>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => saveUser(user.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="dark-btn"
                      onClick={() => startEditing(user)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
