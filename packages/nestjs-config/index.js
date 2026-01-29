class ConfigService {
  get(key) {
    return process.env[key];
  }
}

class ConfigModule {
  static forRoot() {
    return ConfigModule;
  }
}

module.exports = { ConfigModule, ConfigService };
