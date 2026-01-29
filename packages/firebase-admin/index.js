const store = new Map();
const apps = [];

const credential = {
  applicationDefault() {
    return {};
  },
};

function initializeApp() {
  apps.push({});
}

function firestore() {
  return {
    collection(name) {
      if (!store.has(name)) {
        store.set(name, new Map());
      }
      const collectionStore = store.get(name);
      return {
        doc(id) {
          return {
            async get() {
              const data = collectionStore.get(id);
              return {
                exists: !!data,
                data() {
                  return data || null;
                },
              };
            },
            async set(value, options) {
              if (options && options.merge && collectionStore.has(id)) {
                collectionStore.set(id, {
                  ...collectionStore.get(id),
                  ...value,
                });
                return;
              }
              collectionStore.set(id, value);
            },
          };
        },
      };
    },
  };
}

module.exports = {
  apps,
  credential,
  initializeApp,
  firestore,
};
