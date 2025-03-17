const path = require('path');
module.exports = {
   entry: "./src/index.ts",
   mode: "development",
   output: {
       filename: "bundle.js",
       path: path.resolve(__dirname, 'src/assets/javascript/')
   },
   resolve: {
       extensions: [".webpack.js", ".web.js", ".ts", ".js"]
   },
   module: {
       rules: [{ test: /\.ts$/, loader: "ts-loader" }]
   }
}
