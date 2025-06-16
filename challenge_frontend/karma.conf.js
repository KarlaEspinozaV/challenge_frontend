// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        random: true,
      },
      clearContext: config.singleRun, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require("path").join(__dirname, "./coverage/challenge_frontend"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }, { type: "lcov" }],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    reporters: ["progress", "kjhtml"],
    browsers: ["Chrome"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: [
          "--no-sandbox",
          "--disable-web-security",
          "--disable-gpu",
          "--remote-debugging-port=9222",
          "--disable-dev-shm-usage",
        ],
      },
    },
    restartOnFileChange: true,

    // Fix for memfs and webpack issues
    webpack: {
      node: {
        fs: "empty",
        net: "empty",
        tls: "empty",
      },
    },

    // Increase timeouts to handle slow operations
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000,

    // Memory and performance optimizations
    concurrency: 1,

    // File patterns
    files: ["src/**/*.spec.ts"],
    webpack: {
      // otras configuraciones de webpack...
      output: {
        path: require("path").resolve(__dirname, "dist_test"), // carpeta temporal válida
      },
    },
    // Preprocessors
    preprocessors: {
      "src/**/*.ts": ["coverage"],
    },
  });
};
