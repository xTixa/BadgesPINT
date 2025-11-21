// hash.js - gerar hash bcrypt para uma password

import bcrypt from "bcryptjs";

const password = "Password123"; //  a password que usar para os utilizadores

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("Password em texto:", password);
console.log("Hash gerado:", hash);
