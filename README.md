# E-commerce Project Documentation

## Project Overview
This project is an e-commerce web application designed to handle CRUD (Create, Read, Update, Delete) operations. It uses Node.js and Express for the backend, MongoDB Atlas as the database, and EJS for templating. Images are stored in an AWS S3 bucket, and the application leverages various npm packages for functionality such as authentication, file uploads, and database interactions.

## Dependencies
The project uses the following npm packages:
```
{
  "aws-sdk": "^2.1659.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "ejs": "^3.1.10",
  "express": "^4.19.2",
  "mongoose": "^8.5.1",
  "multer": "^1.4.5-lts.1",
  "multer-s3": "^3.0.1",
  "nodemon": "^3.1.4"
}
```
## Prerequisites
Node.js: Ensure you have Node.js installed on your machine.
AWS Account: Create an AWS account if you don't have one.
Installation Instructions
Clone the Repository

```
git clone https://github.com/thanmaisai-asc/Ecommers.git
cd Ecommers
```
### Install Dependencies

```
npm install
```
 ### Set Up Environment Variables
Create a .env file in the root directory and add the following environment variables with your own values:
```
PORT=<your_port>
USERNAME=<your_username>
PASSWORD=<your_password>
MONGO_URI=<your_mongodb_uri>
AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
AWS_REGION=<your_aws_region>
AWS_BUCKET_NAME=<your_aws_s3_bucket_name>
```
### AWS Configuration
## IAM User

Go to the IAM section in AWS Management Console.
Create a new IAM user with programmatic access.
Attach the following policies to the user: AmazonS3FullAccess.
Save the Access Key ID and Secret Access Key.
S3 Bucket

Go to the S3 section in AWS Management Console.
Create a new S3 bucket with the following configurations:
ACL: Enabled.
Public Access: Allow public access.
CORS: Enable CORS.
Bucket Policy:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<your_bucket_name>/*"
        }
    ]
}
```
### Running the Application
Start the Server
```
npm start
or
node src/index.js
```
### Access the Application
Open your browser and navigate to http://localhost:<your_port> to view the e-commerce application.

### Features
User Authentication: Secure login and signup using bcryptjs for hashing passwords.
CRUD Operations: Create, read, update, and delete products.
Image Upload: Upload product images to AWS S3 and store the S3 URL in MongoDB.
Responsive Design: User-friendly interface with EJS templating.
### File Structure

/models: Contains Mongoose schemas for Users and Products.
/routes: Defines the routes for handling user and product-related requests.
/views: EJS templates for rendering the web pages.
/public: Static files (CSS, JS, images).

### Important Notes
Ensure your S3 bucket has proper policies to allow public access to images.
Keep your AWS credentials secure and do not expose them in the codebase.
Use environment variables for sensitive information.
### Conclusion
This documentation provides the necessary steps to set up and run the e-commerce web application. Follow the instructions carefully to configure your environment, AWS services, and run the application successfully.
