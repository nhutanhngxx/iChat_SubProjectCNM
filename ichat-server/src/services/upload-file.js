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
  "video/quicktime", // .MOV
  "video/x-msvideo", // .AVI
  "video/x-ms-wmv", // .WMV
  "audio/mpeg", // Thêm định dạng audio
  "audio/mp4", // Cho mp4 files
  "audio/m4a", // Cho m4a files (một số hệ thống)
  "audio/x-m4a", // Cho m4a files (một số hệ thống)
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];

const MAX_SIZE = {
  image: 10 * 1024 * 1024, // 10MB for images
  video: 100 * 1024 * 1024, // 100MB for videos
  audio: 50 * 1024 * 1024, // 50MB cho audio
  file: 50 * 1024 * 1024, // 50MB for other files
};

const uploadFile = async (file) => {
  const filePath = `${randomString(4)}-${Date.now()}-${file.originalname}`;
  const fileType = file.mimetype ? file.mimetype.split("/")[0] : "file";
  const sizeLimit = MAX_SIZE[fileType] || MAX_SIZE.file;

  if (file.size > sizeLimit) {
    throw new Error(
      `File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB`
    );
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
      console.error("S3 upload error:", error);
      throw new Error("Failed to upload file to S3");
    }
  } else {
    throw new Error("Unsupported file type");
  }
};

module.exports = { uploadFile };
