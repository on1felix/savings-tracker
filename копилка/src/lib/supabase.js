import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iktnmcqheavortylxijt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdG5tY3FoZWF2b3J0eWx4aWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDc2MzcsImV4cCI6MjA5NDUyMzYzN30.GWsZg47M-yrjDpEWMaUZKLW2jX6cnExd6u7Q4DV_bNk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
