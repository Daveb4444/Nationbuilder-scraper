/*
Written by Dave Brown - South Cambs Lib Dems
Based on https://www.toptal.com/puppeteer/headless-browser-puppeteer-tutorial
*/

const fs = require('fs');
const client = require('https');
require('dotenv').config();
const puppeteer = require('puppeteer');
const data = [];
const nbDomain = process.env.DOMAIN;
const newsList = process.env.NB_NEWS_LIST;
const nbNotes = process.env.IMPORT_NOTES;
const defaultMedia = process.env.DEFAULT_NB_MEDIA;
const nbLastDate = new Date( Date.parse(process.env.NB_LAST_DATE) ).getTime();
// console.log('nbLastDate=' + nbLastDate);
let defaultMediaUrl = null;
let defaultMediaAlt = null;
const defaultMediaTitle = process.env.DEFAULT_NB_MEDIA_TITLE;
if(defaultMedia == 1) {
  defaultMediaUrl = process.env.DEFAULT_NB_MEDIA_URL;
  defaultMediaAlt = process.env.DEFAULT_NB_MEDIA_ALT;
}

// Create screenshots folder
if (!fs.existsSync("./screenshots")){
  fs.mkdirSync("./screenshots");
}

// Create Puppeteer cache folder to download CSS and page images to
if (!fs.existsSync("./nbcache")){
  fs.mkdirSync("./nbcache");
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
}

var screenShotCount = 0;
async function takeScreenshot(key, page, i) {
  if(process.env.SCREENSHOT_DEBUG == 1) {
    screenShotCount++;
    let name = "row" + i + "-" + screenShotCount + "-" + key;
    // console.log('Taking screenshot: ' + name);
    await page.screenshot({path: 'screenshots/' + name + '.png'});
  }
}

function run(pagesToScrape) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!pagesToScrape) {
        pagesToScrape = 1;
      }
      // Create browser and page, flags prevent CORS policy: No 'Access-Control-Allow-Origin' issue
      // See https://stackoverflow.com/questions/52129649/puppeteer-cors-mistake/52131823#66744065
      const browser = await puppeteer.launch({
        userDataDir: './nbcache',
        headless: true,
        devtools: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ]
      });
      const page = await browser.newPage();
      // await page.setRequestInterception(true);
      // page.on('request', (request) => {
      //   if (request.resourceType() === 'document') {
      //     request.continue();
      //   } else {
      //     request.abort();
      //   }
      // });

      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      let i = 0;
      if(process.env.CONSOLE_DEBUG) {
        page.on('console', consoleObj => console.log(consoleObj.text()));
      }
      
      // Save and set cookies
      const cookies = await page.cookies();
      // console.log('cookies ='  + cookies);
      await page.setCookie(...cookies);

      await page.goto(newsList);
      await takeScreenshot('news list', page, i);
      let currentPage = 1;
      let urls = [];

      // while (currentPage <= pagesToScrape) {
        await page.waitForSelector('div.blog');
        // console.log('nbDomain=' + nbDomain);
        let dMediaUrl = defaultMediaUrl;
        let dMediaAlt = defaultMediaAlt;
        let dMediaTitle = defaultMediaTitle;
        let nbDate = nbLastDate;
        let newUrls = await page.evaluate((nbDomain,defaultMedia, dMediaUrl, dMediaAlt, dMediaTitle,nbNotes,nbDate) => {
          // console.log('nbDate=' + nbDate);
          let results = [];
          let imageUrl =  null;
          let imageTitle = null;
          let imageAlt = null;
          let items = document.querySelectorAll('div.page-excerpt');
          items.forEach((item) => {
            // Date
            let entryDate = item.querySelector('div.byline > time.entry-date').textContent.trim();
            // NB doesn't give time, so set as one minute after midnight
            let date = new Date( Date.parse( entryDate ) );
            let postTime = date.getTime();
            // console.log('postTime=' + postTime);
            // console.log('postTime < nbDate', postTime < nbDate); // false
            // console.log('postTime > nbDate', postTime > nbDate); // false
            if(postTime > nbDate) {
              let dateString = "00:01 " + date.getUTCDate() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCFullYear();
              let slug = item.querySelector('h3 > a').getAttribute('href');
              let title = item.querySelector('h3 > a').textContent.trim();
              let author = item.querySelector('div.byline > span.author > span').textContent.trim();
              let excerpt = item.querySelector('div.excerpt').textContent.trim();
              // console.log('title ='  + title);
          

              let body = item.querySelector('#intro > .content').innerHTML; 
              // Nationbuilder adds \n<hr> at the end of each post, which ends up visible in Fleet
              // so just delete it!
              body = body.replaceAll('<hr>\n','');
              // and get rid of empty paragraphs!
              body = body.replaceAll('<p>&nbsp;</p>','');
              // if(!body.match(/<p/)) {
              //   body = "<p>" + row.content + "</p>";
              // }

              // Media
              let keyImageData = item.querySelector('a > img.key');
              let postImageData = item.querySelector('#intro > .content > p > img');
              let mediaName;
              if(keyImageData) { // use key image if it exists
                imageUrl =  keyImageData.getAttribute('src');
                imageTitle = keyImageData.getAttribute('title');
                imageAlt = keyImageData.getAttribute('alt');
              }else if(postImageData) {     // else use first image in post if it exists          
                imageUrl =  postImageData.getAttribute('src');
                imageTitle = postImageData.getAttribute('title');
                imageAlt = postImageData.getAttribute('alt');
              }else if(defaultMedia==1) { // else use default values if there are no images
                imageUrl =  dMediaUrl;
                imageTitle = dMediaTitle;
                imageAlt = dMediaAlt;
              }else{ // else leave them as null
                imageUrl =  null;
                imageTitle = null;
                imageAlt = null;
              }
              console.log('imageUrl=' + imageUrl);
              if(imageUrl){
                let mediaNameParts = imageUrl.split('/')
                mediaName = mediaNameParts[mediaNameParts.length-1];
                mediaName = mediaName.slice(0,mediaName.indexOf('?'));
                console.log('mediaName yes=' + mediaName);
              // }else{
              //   mediaName = '';
              //   console.log('mediaName no=' + mediaName);
              }
              console.log('mediaName=' + mediaName);

              //set imageTitle equal to imageAlt if it doesn't exist
              if(imageTitle == null) { imageTitle = imageAlt; }
              
              // remove " Read more" from end of excerpt            
              excerpt = excerpt.slice(0,-10);
              // trim to end of first sentence if it exists
              let sentenceEnd = excerpt.indexOf('.');
              if (sentenceEnd > 5) {
                excerpt = excerpt.slice(0,sentenceEnd);
              }
              // trim if too long
              if(excerpt.length > 150) {
                excerpt = excerpt.substring(0, 150) + "...";
              }
              results.push({ 
                slug: slug,
                title: title,
                date: dateString,
                author: author,
                content: body,
                featuredImageURL: imageUrl,
                imageTitle: imageTitle,
                imageAlt: imageAlt,
                excerpt: excerpt,
                notes: nbNotes,
                mediaName: mediaName
              });
            }
          });
          return results;
        },nbDomain,defaultMedia, dMediaUrl, dMediaAlt, dMediaTitle, nbNotes, nbLastDate);
        urls = urls.concat(newUrls); // comment out to prevent console logging of all the data 
        let dataString = JSON.stringify(urls, null, 2);;
        fs.writeFile('./data/importnb.json', dataString, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });

      //   if (currentPage < pagesToScrape) {
      //     await Promise.all([
      //       await page.waitForSelector('a.morelink'),
      //       await page.click('a.morelink'),
      //       await page.waitForSelector('a.storylink')
      //     ])
      //   }
      //   currentPage++;
      // }
      browser.close();
      return resolve(urls);
    } catch (e) {
      return reject(e);
    }
  })
  // check for default media in urls
  // stringify
}
run(1).then(console.log).catch(console.error);