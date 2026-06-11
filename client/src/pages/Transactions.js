import React, { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import { useAuth } from '../contexts/AuthContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactions(user.token);
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
    };

    if (user && user.token) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="mt-4">
        {transactions.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Category</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Type</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-2 border">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{transaction.category_name}</td>
                  <td className="px-4 py-2 border">{transaction.amount}</td>
                  <td className="px-4 py-2 border">{transaction.type}</td>
                  <td className="px-4 py-2 border">{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default Transactions;