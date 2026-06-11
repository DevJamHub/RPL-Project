const supabase = require('../config/supabaseClient');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.error('Supabase registration error:', error.message);
      return res.status(400).json({ message: error.message });
    }
    
    // The user is signed up but not yet confirmed.
    // Supabase sends a confirmation email by default.
    // For simplicity in our app, we'll treat them as logged in.
    const user = data.user;
    res.status(201).json({
      message: 'User registered successfully. Please check your email to confirm.',
      user: {
        id: user.id,
        name: user.user_metadata.name,
        email: user.email,
      },
      token: data.session.access_token, // Supabase provides the token
    });
  } catch (error) {
    console.error('Server registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error.message);
      return res.status(401).json({ message: error.message });
    }

    const user = data.user;
    res.json({
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        id: user.id,
        name: user.user_metadata.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Server login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };