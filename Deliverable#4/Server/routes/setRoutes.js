
const { setSocketRoutes } = require("./socketRoutes.js");
const { setRestRoutes } = require("./restRoutes.js");

exports.setRoutes = async (app) => {
  await setSocketRoutes(app);
  await setRestRoutes(app);

  return app;
}
