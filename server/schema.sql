-- Users Table: Stores user credentials and profile information.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nim VARCHAR(50),
    university VARCHAR(255),
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table: Stores default and user-defined transaction categories.
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('Income', 'Expense') NOT NULL
);

-- Transactions Table: Logs all financial activities for each user.
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Budgets Table: Manages monthly budget limits per category for each user.
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, month, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Initial Data for Categories
INSERT INTO categories (name, type) VALUES
('Food/Makan', 'Expense'),
('Transport', 'Expense'),
('Boarding/Utilities', 'Expense'),
('Entertainment', 'Expense'),
('Shopping', 'Expense'),
('Education', 'Expense'),
('Health', 'Expense'),
('Others', 'Expense'),
('Allowance', 'Income'),
('Scholarship', 'Income'),
('Part-time Job', 'Income');