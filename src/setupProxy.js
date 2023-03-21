const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/github/auth",
    createProxyMiddleware({
      target: "https://github.com",
      changeOrigin: true,
      pathRewrite: {
        "^/github/auth": "/login/oauth/access_token",
      },
      onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader("Accept", "application/json");
      },
      onProxyRes: function (proxyRes, req, res) {
        // Modify the response as needed
        return res;
      },
    })
  );
};
