import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      {user && <p className="mt-2">Hello, {user.name}!</p>}
      <button
        onClick={handleLogout}
        className="px-4 py-2 mt-4 font-bold text-white bg-red-500 rounded hover:bg-red-700"
      >
        Logout
      </button>
      <Link to="/transactions">
        <button className="px-4 py-2 mt-4 ml-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
          Go to Transactions
        </button>
      </Link>
    </div>
  );
};

export default Dashboard;