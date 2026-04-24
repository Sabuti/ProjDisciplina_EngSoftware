const pocketbaseClient = {
  authStore: {
    isValid: true,
    model: { id: "user_mock" }
  },

  collection: (name) => ({
    getFullList: async () => {
      console.log(`Mock frontend: getFullList ${name}`);
      return [];
    },
    create: async (data) => {
      console.log(`Mock frontend: create ${name}`, data);
      return data;
    }
  })
};

// 👇 ESSENCIAL
export default pocketbaseClient;
export { pocketbaseClient };