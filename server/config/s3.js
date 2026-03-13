const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.S3_BUCKET_NAME;

/**
 * Delete a single object from S3 by its key.
 * @param {string} key – The S3 object key (e.g. "products/1700000000-shirt.jpg")
 */
async function deleteFromS3(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );
}

module.exports = { s3, S3_BUCKET, deleteFromS3 };
