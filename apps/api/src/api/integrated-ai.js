// Simulação de tipos de conteúdo
export const ContentBlockType = {
  TEXT: "text",
  IMAGE: "image"
};

// Simulação de stream (fake)
export async function stream(prompt) {
  return {
    type: ContentBlockType.TEXT,
    content: "Resposta simulada para: " + prompt
  };
}

// Simulação de upload de imagem
export async function uploadImagesToPocketBase(images) {
  return images.map((img, index) => ({
    url: `https://fakeimage.com/${index}`,
    name: img?.name || `image_${index}`
  }));
}