require("dotenv").config({
  path: "./server/.data/.env",
  silent: true
});

require("babel-register");
require('./server.js').serverStart();