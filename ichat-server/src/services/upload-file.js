const { s3 } = require("../utils/aws-helper");

const randomString = (numberChar) => {
  return `${Math.random()
    .toString(36)
    .substring(2, numberChar + 2)}`;
};

const FILE_TYPE_MATCH = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp3",
  "video/mp4",
  "video/mov",
  "audio/mpeg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];
const MAX_SIZE = 1024 * 1024 * 10;

const uploadFile = async (file) => {
  const filePath = `${randomString(4)}-${Date.now()}-${file.originalname}`;
  if (file.size > MAX_SIZE) {
    throw new Error("Dung lượng file vượt quá 10MB!!!");
  }
  if (FILE_TYPE_MATCH.includes(file.mimetype)) {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    try {
      const data = await s3.upload(uploadParams).promise();
      return data.Location;
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = { uploadFile };
