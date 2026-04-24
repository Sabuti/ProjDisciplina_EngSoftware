const BASE_URL = "https://projdisciplina-engsoftware.onrender.com/";

export const integratedAiClient = {
  async stream(path, options = {}) {
    return fetch(BASE_URL + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.body),
      signal: options.signal,
    });
  },
};