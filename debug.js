require('dotenv').config();
console.log(`Debugging ${process.env.NODE_ENV} environment`);
require('./src/index');
