export async function post<T, U>(path: string, body: T): Promise<U> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${path}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}