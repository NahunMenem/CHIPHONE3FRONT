// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error de login");
  }

  return res.json();
}
