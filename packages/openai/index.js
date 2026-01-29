class OpenAI {
  constructor() {
    this.chat = {
      completions: {
        async create() {
          return {
            choices: [
              {
                message: {
                  content: 'Stub response',
                },
              },
            ],
          };
        },
      },
    };
  }
}

module.exports = OpenAI;
