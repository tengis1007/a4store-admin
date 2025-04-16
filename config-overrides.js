module.exports = function override(config, env) {
    config.ignoreWarnings = [
      {
        module: /@mediapipe\/tasks-vision/,
        message: /Failed to parse source map/,
      },
    ];
    return config;
  };
  