const mongoose = require("mongoose");
require("dotenv").config();

// const username = process.env.username; 
const password = process.env.password; 
const dbName = "dbecu"; 

mongoose.connect(
 `mongodb+srv://ecommerce-ascendion:${password}@asc-commerce-cluster.yhhhzoo.mongodb.net/${dbName}`
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected successfully");
});

const LoginSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    createdAt:{
      type : Date,
      default : Date.now,
    },
    updatedAt : {
      type : Date,
      default : Date.now,

    },

});

const productSchema = new mongoose.Schema({
  prodname : {
    type : String,
    required : true ,
  },
  cost : {
    type : Number,
    required : true,

  },
    description : {
      type : String,
      required: true,
    },
    createdAt : {
      type:Date,
      default:Date.now
    },
    updatedAt : {
      type:Date,
      default:Date.now
    }
})
  

const User = mongoose.model("User", LoginSchema);
const Products = mongoose.model("prods",productSchema);

module.exports = {User,Products};