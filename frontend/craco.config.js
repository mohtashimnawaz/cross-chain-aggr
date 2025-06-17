const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure resolve.fallback exists
      if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
      }
      if (!webpackConfig.resolve.fallback) {
        webpackConfig.resolve.fallback = {};
      }

      // Add essential fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        vm: require.resolve('vm-browserify'),
        util: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        zlib: false,
        querystring: false,
        url: false,
        punycode: false,
        readline: false,
        repl: false,
        tty: false,
        string_decoder: false,
        timers: false,
        events: false,
        domain: false,
        constants: false,
        module: false,
        inspector: false,
        cluster: false,
        worker_threads: false,
        perf_hooks: false,
        async_hooks: false,
        v8: false,
        trace_events: false,
        wasi: false,
        diagnostics_channel: false,
      };

      // Add module resolution rules
      if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
      }

      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser'),
      };

      // Add module rules to handle .mjs files
      if (!webpackConfig.module) {
        webpackConfig.module = {};
      }
      if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = [];
      }

      // Add a rule to handle .mjs files
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      // Add plugins
      if (!webpackConfig.plugins) {
        webpackConfig.plugins = [];
      }
      
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        })
      );

      // Configure source map loader to suppress warnings
      const sourceMapLoaderRule = webpackConfig.module.rules.find(
        rule => rule.loader && rule.loader.includes('source-map-loader')
      );
      
      if (sourceMapLoaderRule) {
        sourceMapLoaderRule.options = {
          ...sourceMapLoaderRule.options,
          filterSourceMappingUrl: (url, resourcePath) => {
            // Suppress warnings for Solana and related packages
            if (resourcePath.includes('@solana') || 
                resourcePath.includes('@reown') ||
                resourcePath.includes('superstruct') ||
                resourcePath.includes('bs58') ||
                resourcePath.includes('tweetnacl')) {
              return false;
            }
            return true;
          }
        };
      }

      // Configure source map loader to suppress warnings from specific packages
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/@solana/,
          /node_modules\/@reown/,
          /node_modules\/superstruct/,
          /node_modules\/bs58/,
          /node_modules\/tweetnacl/,
          /node_modules\/@trezor/,
          /node_modules\/@walletconnect/,
          /node_modules\/eth-rpc-errors/,
          /node_modules\/jsbi/,
          /node_modules\/@fractalwagmi/,
          /node_modules\/asn1\.js/,
        ],
      });

      // Suppress source map warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Module not found: Can't resolve/,
      ];

      return webpackConfig;
    },
  },
}; 