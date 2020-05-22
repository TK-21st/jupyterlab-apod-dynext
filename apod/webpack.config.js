module.exports = {
    entry: './lib/index.js',
    mode: 'development',
    output: {
      path: require('path').join(__dirname, 'build'),
      filename: 'bundle.js',
      libraryTarget: 'amd'
    },
    bail: true
  };