const BASE_URL = "https://projdisciplina-engsoftware.onrender.com";

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    headers: defaultHeaders,
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro na requisição");
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

const apiServerClient = {
  get: (path) => request(path, { method: "GET" }),

  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};

export default apiServerClient;
export { apiServerClient };