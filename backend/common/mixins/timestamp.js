module.exports = Model => {
  Model.defineProperty("createdAt", {
    type: Date,
    required: true,
    default: "$now"
  });
  Model.defineProperty("lastModifiedAt", {
    type: Date,
    required: true,
    default: "$now"
  });

  Model.observe("before save", (ctx, next) => {
    if (ctx.instance) {
      ctx.instance.lastModifiedAt = new Date();
      if (!ctx.isNewInstance) delete ctx.instance.createdAt;
    } else {
      ctx.data.lastModifiedAt = new Date();
      if (!ctx.isNewInstance) delete ctx.data.createdAt;
    }
    next();
  });
};
