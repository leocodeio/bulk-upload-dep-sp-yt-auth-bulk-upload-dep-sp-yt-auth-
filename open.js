import puppeteer from 'puppeteer';

const VIDEO_URLS = [
  "https://www.youtube.com/shorts/bgkvOaMH7CU",
];

async function openVideo(videoUrl, times = 10) {
  try {
    console.log(`Opening video ${times} times for: ${videoUrl}`);
    
    for (let i = 0; i < times; i++) {
      const browser = await puppeteer.launch({
        channel: 'chrome',
        headless: false,
        executablePath: '/usr/bin/google-chrome-stable'  
      });
      const page = await browser.newPage();
      await page.goto(videoUrl);
      
      // Wait for the video player to load
      await page.waitForSelector('video');
      
      // Click on the video to start playing
      await page.evaluate(() => {
        const video = document.querySelector('video');
        console.log(video);
        if (video) {
          video.play();
        }
      });
      
      // Wait for video duration (at least 5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await browser.close();
      console.log(`Completed view ${i + 1}/${times} for ${videoUrl}`);
    }

  } catch (error) {
    console.error(`Error opening video ${videoUrl}:`, error.message);
  }
}

async function openAllVideos() {
  console.log("Starting to open all videos...");

  for (const url of VIDEO_URLS) {
    await openVideo(url);
    // Add delay between videos
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("Finished opening all videos!");
}

// Run the process
openAllVideos().catch(console.error);