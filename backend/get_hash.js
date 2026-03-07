const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('officer123', 10);
console.log('HASH:', hash);
