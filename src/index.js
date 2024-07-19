const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cors = require('cors')
// const User = require('./config'); // assuming your model is named User
// const Products =  require('./config')  // the products schema
const {User,Products} = require('../src/config')
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

app.set('view engine', 'ejs');
app.use(express.static("public"));

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username: username });

    if (!user) {
      // User not found
      return res.status(404).send("User not found");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Invalid password
      return res.status(401).send("Invalid password");
    }

    // If login is successful, redirect to store.ejs
    res.redirect('/store'); // Assuming 'store.ejs' is in your views directory
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

// Signup POST route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new user instance
    const newUser = new User({
      username: username,
      password: hashedPassword
    });

    // Save user to the database
    const savedUser = await newUser.save();

    console.log("User signed up:", savedUser);
    res.send("User signed up successfully");
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send("Error signing up");
  }
});


//store 
app.get('/store',async(req,res)=>{
  try {
    const products = await Products.find();
    res.render('store', { products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).send("Error retrieving products");
  }
});

app.delete('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Products.findByIdAndDelete(id);
    res.status(200).send("Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
});




// Server listening
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});











// const express = require('express');
// const path = require('path');
// const bcrypt = require('bcrypt');
// const dotenv = require('dotenv');
// // const User = 
// require('./config'); // assuming your model is named User
// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({extended:false}));

// app.set('view engine', 'ejs');
// app.set(express.static("public"));

// // app.use(express.static(path.join(__dirname, 'public')));
// // app.set('view engine', 'ejs');
// // app.set('views', path.join(__dirname, 'views'));

// app.get('/', (req, res) => {
//   res.render('login');
// });

// app.get('/signup', (req, res) => {
//   res.render('signup');
// });

// app.post("/signup",(req,res)=>{
//     const data = {
//         name: req.body.username,
//         password: req.body.password,
//     }
//     const userdata = collection.insertMany(data)
//     console.log(userdata);
// })

// const port = process.env.PORT ;

// app.listen(port, () => {
//   console.log(`Server running on Port: ${port}`);
// });

