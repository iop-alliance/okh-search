const withCss = require('@zeit/next-css')

module.exports = withCss({
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|svg|eot|otf|ttf|woff|woff2)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/',
          outputPath: 'static',
          name: '[name].[hash].[ext]'
        }
      }
    })

    return config
  }
})
