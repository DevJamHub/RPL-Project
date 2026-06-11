const pool = require('../config/database');

const Transaction = {
  async create({ userId, categoryId, amount, description, transactionDate, type }) {
    const [result] = await pool.execute(
      'INSERT INTO transactions (user_id, category_id, amount, description, transaction_date, type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, categoryId, amount, description, transactionDate, type]
    );
    return result.insertId;
  },

  async findAllByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT t.id, c.name as category, t.amount, t.description, t.transaction_date, t.type 
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? 
       ORDER BY t.transaction_date DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.execute(
      `SELECT t.id, c.name as category, t.amount, t.description, t.transaction_date, t.type 
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );
    return rows[0];
  },

  async update(id, userId, { amount, categoryId, description, transactionDate }) {
    const [result] = await pool.execute(
      'UPDATE transactions SET amount = ?, category_id = ?, description = ?, transaction_date = ? WHERE id = ? AND user_id = ?',
      [amount, categoryId, description, transactionDate, id, userId]
    );
    return result.affectedRows;
  },

  async remove(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  }
};

module.exports = Transaction;