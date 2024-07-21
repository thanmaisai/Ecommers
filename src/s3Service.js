const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
require('dotenv').config();

const bucketName = 'ecom-bucket-asc';
const region = 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
});

// Upload a file to S3
function uploadFile(filePath, fileName) {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: fileName
  };

  return s3.upload(uploadParams).promise();
}

// List images in the S3 bucket
function getImages() {
  const listParams = {
    Bucket: bucketName
  };

  return s3.listObjectsV2(listParams).promise();
}

module.exports = {uploadFile,getImages};