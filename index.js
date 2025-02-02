const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

// Configuration
const API_BASE_URL = "http://localhost:3001/v1.0/youtube/api/upload"; // Adjust this to match your API URL
const VIDEO_PATH = "./upload.mp4";
const YT_CREATOR_IDS = [
  "256be03c-0d37-446c-be8a-27e83fc38210",
  "71569ea9-14dc-4f67-bdd6-a350ad542cf4",
  "9886d5c2-e4fe-40ec-8384-6598811e88a6",
  "a7354e13-3bcf-40d1-bcd7-bd0322feced1",
  "b3d756d0-9dc1-4a0b-9cca-de458917c0d3",
];
// Video metadata
const videoMetadata = {
  title: "Couldn't Believe My Eyes: A Once in a Lifetime Experience",
  description:
    "Captured an unbelievable moment that truly is a once in a lifetime experience. Watch to see what left me in awe!",
  tags: ["unbelievable", "once in a lifetime", "amazing experience"],
  privacyStatus: "public",
};

async function uploadVideoForCreator(creatorId, videoPath) {
  try {
    const formData = new FormData();

    // Add the video file and metadata fields separately
    formData.append("video", fs.createReadStream(videoPath));
    formData.append("title", videoMetadata.title);
    formData.append("description", videoMetadata.description);
    formData.append("tags", videoMetadata.tags.join(","));
    formData.append("privacyStatus", videoMetadata.privacyStatus);

    console.log(`Starting upload for creator ID: ${creatorId}`);

    const response = await axios.post(
      `${API_BASE_URL}?id=${creatorId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": "apikey",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log(`Upload successful for creator ID: ${creatorId}`);
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error uploading for creator ID ${creatorId}:`,
      error.message
    );
    return null;
  }
}

async function uploadVideoToAllCreators() {
  console.log("Starting batch upload process...");
  const startTime = Date.now();

  // Validate video file exists
  if (!fs.existsSync(VIDEO_PATH)) {
    console.error("Video file not found at:", VIDEO_PATH);
    return;
  }

  const totalCreators = YT_CREATOR_IDS.length;

  // Upload to each creator sequentially
  for (let i = 0; i < YT_CREATOR_IDS.length; i++) {
    const id = YT_CREATOR_IDS[i];
    const completedPercentage = ((i / totalCreators) * 100).toFixed(1);
    console.log(
      `Progress: ${completedPercentage}% (${i}/${totalCreators} creators)`
    );

    try {
      await uploadVideoForCreator(id, VIDEO_PATH);
    } catch (error) {
      console.error(`Failed to upload for creator ${id}:`, error);
    }

    // Add a small delay between uploads to prevent overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const endTime = Date.now();
  const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(1);
  console.log(
    `Batch upload process completed! Total time: ${totalTimeSeconds} seconds`
  );
}

// Run the upload process
uploadVideoToAllCreators().catch(console.error);
