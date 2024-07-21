const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors')
const { User, Products } = require('../src/config');
dotenv.config();


//aws-sdk
const multer = require('multer')
const {getImages,uploadFile} = require('../src/s3Service')
const router = express.Router();

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'./upload');
  },
  filename:function(req,file,cb){
    const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()*1E9);
    cb(null,uniqueSuffix+path.extname(file.originalname));
  }
})
const upload = multer({storage})


const app = express();

// Middlewear
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/inputprod', (req, res) => {
  res.render('inputprod');
});


// home page
app.get('/home',async(req,res)=>{
  try {
    const products = await Products.find();
    res.render('home', { products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).send("Error retrieving products");
  }
});

// create
// localhost:5000/create
/*
{
  prodname,
  cost,
  description
}
*/
app.post('/create', upload.single('image'), async (req, res) => {
  const { prodname, cost, proddesc } = req.body;
  const image = req.file;

  try {
    // Create a new instance of Products model
    const newProduct = new Products({
      prodname: prodname,
      cost: cost,
      description: proddesc,
    });

    // Handle image upload
    if (image) {
      console.log("File saved to:", image.path);
      const result = await uploadFile(image.path, image.filename);
      console.log('S3 upload result:', result);

      // Update product with S3 details
      newProduct.s3Key = result.Key;
      newProduct.s3Url = result.Location;
    } else {
      console.log("No image file uploaded");
    }

    // Save the new product to the database
    await newProduct.save();
    console.log("New product added successfully:", newProduct);

    res.status(201).json({ success: true, message: "Product added successfully" });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, message: "Failed to add product", error: err.message });
  }
});

// update
// localhost:5000/update
/*
{
  prodname:"",
  cost:"",
  description:""
}
*/
app.put('/update', async (req, res) => {
  const { id, ...rest } = req.body;
  console.log(rest);
  const data = await Products.updateOne({ _id: id }, rest);

  res.json({ success: true, message: "Product updated successfully", data: data });
});

//delete
// localhost:5000/delete/669a1506aeed16273556a168
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

// Products homepage




// Server listening
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});


