const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfmlayuxhkoigwxormlg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbWxheXV4aGtvaWd3eG9ybWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODc2MjIsImV4cCI6MjA5Njc2MzYyMn0.iNUHPIN3as3n96Jh64EvAaguIjN5oYNouT9_8SapjeI';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;