const NestFactory = {
  async create() {
    return {
      async listen(port) {
        console.log(`Listening on port ${port}`);
      },
    };
  },
};

module.exports = { NestFactory };
