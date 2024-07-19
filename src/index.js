const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/config');
dotenv.config();

const app = express();

// Middlewear
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});


app.get('/home', (req, res) => {
  res.render('home');
});

// Signup POST route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      name: username,
      password: hashedPassword
    });

    // Check if user already exists
    const existingUser = await User.findOne({ name: username });
    if (existingUser) {
      console.log("User already exists. Please choose a different username");
      return res.status(400).send("User already exists. Please choose a different username");
    } else {
      // Save user to the database
      const savedUser = await newUser.save();
      console.log("User signed up:", savedUser);
      res.send("User signed up successfully");
    }

  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send("Error signing up");
  }
});


// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if username exists
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      console.log("Logged in successfully");
      // Redirect to the '/home' route
       res.redirect('/home');

    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Server listening
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});


