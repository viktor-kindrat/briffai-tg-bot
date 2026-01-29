const decoratorFactory = () => (target, key, descriptor) => descriptor || target;

class TelegrafModule {
  static forRoot() {
    return TelegrafModule;
  }
}

module.exports = {
  TelegrafModule,
  Update: decoratorFactory,
  On: decoratorFactory,
  Ctx: decoratorFactory,
};
