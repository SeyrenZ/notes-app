import { Note, NoteCreate, NoteUpdate, TagCreate } from "@/types/note";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createNote(
  note: NoteCreate,
  token: string
): Promise<Note> {
  const response = await fetch(`${API_URL}/v1/notes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create note");
  }

  return await response.json();
}

export async function updateNote(
  id: number,
  note: NoteUpdate,
  token: string
): Promise<Note> {
  const response = await fetch(`${API_URL}/v1/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update note");
  }

  return await response.json();
}

export async function getNotes(
  token: string,
  archived: boolean = false
): Promise<Note[]> {
  const response = await fetch(`${API_URL}/v1/notes/?archived=${archived}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch notes");
  }

  return await response.json();
}

export async function getNote(id: number, token: string): Promise<Note> {
  const response = await fetch(`${API_URL}/v1/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch note");
  }

  return await response.json();
}

export async function deleteNote(id: number, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/notes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete note");
  }
}

export async function addTagsToNote(
  id: number,
  tags: TagCreate[],
  token: string
): Promise<Note> {
  const response = await fetch(`${API_URL}/v1/notes/${id}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tags),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to add tags to note");
  }

  return await response.json();
}
