module.exports = (handle) => {
  return async (req, res, next) => {
    try {
      await handle(req, res);
    } catch (error) {
      next(error);
    }
  };
};
