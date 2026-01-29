const decoratorFactory = () => (target, key, descriptor) => descriptor || target;

module.exports = {
  Injectable: decoratorFactory,
  Module: decoratorFactory,
  Controller: decoratorFactory,
  Get: decoratorFactory,
};
