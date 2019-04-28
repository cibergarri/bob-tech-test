require('dotenv').config();
console.log(`Debugging ${process.env.NODE_ENV} environment`);
const app = require('./src/index');

app.run();
