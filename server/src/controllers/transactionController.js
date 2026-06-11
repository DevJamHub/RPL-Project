const supabase = require('../config/supabaseClient');

const getTransactions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        description,
        transaction_date,
        type,
        categories (
          name
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Rename category object to category_name for frontend compatibility
    const transactions = data.map(t => ({
      ...t,
      category_name: t.categories.name,
      categories: undefined, // remove the original categories object
    }));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTransaction = async (req, res) => {
  const { categoryId, amount, description, transactionDate, type } = req.body;

  if (!categoryId || !amount || !transactionDate || !type) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: req.user.id,
        category_id: categoryId,
        amount,
        description,
        transaction_date: transactionDate,
        type,
      }])
      .select(`
        id,
        amount,
        description,
        transaction_date,
        type,
        categories (
          name
        )
      `)
      .single();

    if (error) throw error;
    
    const newTransaction = {
      ...data,
      category_name: data.categories.name,
      categories: undefined,
    };

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, categoryId, description, transactionDate, type } = req.body;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount,
        category_id: categoryId,
        description,
        transaction_date: transactionDate,
        type,
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select(`
        id,
        amount,
        description,
        transaction_date,
        type,
        categories (
          name
        )
      `)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Transaction not found or user not authorized' });
    }
    
    const updatedTransaction = {
      ...data,
      category_name: data.categories.name,
      categories: undefined,
    };

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const { error, count } = await supabase
      .from('transactions')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    if (count === 0) {
      return res.status(404).json({ message: 'Transaction not found or user not authorized' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};