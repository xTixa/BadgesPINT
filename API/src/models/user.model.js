const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
/*
class User {
    static async create(userData) {
        const { name, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return result;
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}
*/
module.exports = User;