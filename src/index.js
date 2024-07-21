const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { User, Products } = require('../src/config');
const { getImages, uploadFile } = require('../src/s3Service');

dotenv.config();

const app = express();
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
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

app.get('/home', async (req, res) => {
  try {
    const products = await Products.find();
    res.render('home', { products });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).send("Error retrieving products");
  }
});

// Create product
app.post('/create', upload.single('image'), async (req, res) => {
  const { prodname, cost, description } = req.body;
  const image = req.file;

  try {
    const newProduct = new Products({
      prodname: prodname,
      cost: cost,
      description: description,
    });

    if (image) {
      console.log("File saved to:", image.path);
      const result = await uploadFile(image.path, image.filename);
      console.log('S3 upload result:', result);

      newProduct.s3Key = result.Key;
      newProduct.s3Url = result.Location;
    } else {
      console.log("No image file uploaded");
    }

    await newProduct.save();
    console.log("New product added successfully:", newProduct);

    res.status(201).json({ success: true, message: "Product added successfully" });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, message: "Failed to add product", error: err.message });
  }
});

// Update product
// Route to handle updating a product
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { prodname, cost, description } = req.body;

  try {
    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      { prodname, cost, description },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
  }
});



// Delete product
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

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: username,
      password: hashedPassword
    });

    const existingUser = await User.findOne({ name: username });
    if (existingUser) {
      console.log("User already exists. Please choose a different username");
      return res.status(400).send("User already exists. Please choose a different username");
    } else {
      const savedUser = await newUser.save();
      console.log("User signed up:", savedUser);
      res.send("User signed up successfully");
    }

  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send("Error signing up");
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      console.log("Logged in successfully");
      res.redirect('/home');
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Route to render edit page for a specific product
// Route to render edit page for a specific product
app.get('/editprod/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render('editprod', { product });
  } catch (error) {
    console.error("Error retrieving product for edit:", error);
    res.status(500).send("Error retrieving product for edit");
  }
});


// Server listening
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
