import axios from "axios";
import fs from "fs";
import FormData from "form-data";

import dotenv from "dotenv";
dotenv.config();

// Configuration
const VIDEO_PATH = "./upload.mp4";
const YT_CREATOR_IDS = [
  "a856880a-f5f9-4296-b2d4-50ec740e0385",
  "b15d918d-a9a1-4e57-ad77-0828985b691c",
  "cc2c9d1d-dfac-4ac6-b611-a9c557bd473e",
  "90c20adb-6210-4515-b0bc-701e1a3f339f",
  "d99ea175-8731-4b65-a6ca-eb7a3141f989",
];

// Video metadata
const videoMetadata = {
  title: "Relatable?????!!!!",
  description:
    "#anime #manga #otaku #animeart #animelife #animelover #animefan #weeb #weeaboo #animecommunity #animeworld #animeedits #animememes #cosplay #japaneseanime #animeaesthetic #animegirl #animeboy #animestyle #naruto #onepiece #dragonballz #dbz #attackontitan #deathnote #fmab #fullmetalalchemist #mha #myheroacademia #swordartonline #sao #tokyoghoul #bleach #fairytail #hunterxhunter #hxh #demonslayer #kimetsunoyaiba #evangelion #nge #cowboybebop #codegeass #steinsgate #blackclover #jojo #jjba #rezero #uzumakinaruto #luffy #goku #eren #lightyagami #midoriya #kirito #kaneki #ichigo #natsu #gon #tanjiro #shinji #spike #lelouch #okabe #asta #jotaro #shounen #shonen #seinen #shoujo #shojo #isekai #mecha #sliceoflife #fantasy #action #adventure #romance #comedy #drama #supernatural #scifi #horror #psychological #fighting #kawaii #sugoi #nani #baka #senpai #kun #chan #san #sama #sensei #nakama #dattebayo #plusultra #mangaka #seiyuu #voiceactor #animation #sakuga #openingsong #ending #ost #soundtrack #lightnovel #visualnovel #manhwa #manhua #animelove #animefeels #animehype #animemoments #animequotes #animescenes #animeships #animefights #animelogic #crunchyroll #funimation #netflix #animestreaming #animenetwork #vrv #hidive #gogoanime #animesketch #animeartist #animedrawing #mangaart #mangastyle #chibi #bishonen #bishojo #moe #fanart #animetwt #animefandom #animecosplay #animecon #convention #cosplayer #cosplaylife #animecollector #merchandise #figurecollector #seasonalanime #newanime #upcominganime #ongoing #animeschedule #simulcast #subbed #dubbed #mustwatch #recommended #topanime #bestanime #classicanime #cultanime #underratedanime #popularanime #japaneseculture #otakuculture #akihabara #japan #tokyo #animejapan",
  tags: [
    "anime",
    "manga",
    "otaku",
    "animeart",
    "animelife",
    "animelover",
    "animefan",
    "weeb",
    "weeaboo",
    "animecommunity",
    "animeworld",
    "animeedits",
    "animememes",
    "cosplay",
    "japaneseanime",
    "animeaesthetic",
    "animegirl",
    "animeboy",
    "animestyle",
    "naruto",
    "onepiece",
    "dragonballz",
    "dbz",
    "attackontitan",
    "deathnote",
    "fmab",
    "fullmetalalchemist",
    "mha",
    "myheroacademia",
    "swordartonline",
    "sao",
    "tokyoghoul",
    "bleach",
    "fairytail",
    "hunterxhunter",
    "hxh",
    "demonslayer",
    "kimetsunoyaiba",
    "evangelion",
    "nge",
    "cowboybebop",
    "codegeass",
    "steinsgate",
    "blackclover",
    "jojo",
    "jjba",
    "rezero",
  ],
  privacyStatus: "public",
  thumbnail: "./thumbnail.png",
};

async function uploadVideoForCreator(creatorId, videoPath) {
  try {
    const formData = new FormData();
    const startTime = Date.now();

    // Add the video file and metadata fields separately
    formData.append("video", fs.createReadStream(videoPath));
    formData.append("title", videoMetadata.title);
    formData.append("description", videoMetadata.description);
    formData.append("tags", videoMetadata.tags.join(","));
    formData.append("privacyStatus", videoMetadata.privacyStatus);
    // formData.append("thumbnail", fs.createReadStream(videoMetadata.thumbnail));
    console.log(`Starting upload for creator ID: ${creatorId}`);

    // Add upload progress event handler
    const response = await axios.post(
      `${process.env.API_BASE_URL}/youtube/api/upload?id=${creatorId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": process.env.YT_SERVER_KEY,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(
            `Upload progress for creator ${creatorId}: ${percentCompleted}%`
          );
        },
      }
    );

    const endTime = Date.now();
    const uploadDuration = ((endTime - startTime) / 1000).toFixed(1);
    console.log(
      `Upload successful for creator ID: ${creatorId} (took ${uploadDuration}s)`
    );
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
