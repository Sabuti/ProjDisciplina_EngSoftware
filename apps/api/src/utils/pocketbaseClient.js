// Mock do PocketBase

const pocketbaseClient = {
  collection: (name) => ({
    getList: async () => {
      console.log(`Mock: getList em ${name}`);
      return [];
    },

    getFullList: async () => {
      console.log(`Mock: getFullList em ${name}`);
      return [];
    },

    create: async (data) => {
      console.log(`Mock: create em ${name}`, data);
      return { id: "mock-id", ...data };
    },

    update: async (id, data) => {
      console.log(`Mock: update em ${name}`, id, data);
      return { id, ...data };
    },

    delete: async (id) => {
      console.log(`Mock: delete em ${name}`, id);
      return true;
    }
  }),

  // mock de autenticação (se precisar)
  authStore: {
    isValid: true,
    model: { id: "user_mock" }
  }
};

export default pocketbaseClient;