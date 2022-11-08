/*
Original code import_posts.js written by Stuart Lawrence - Elmbridge Lib Dems
Minor changes to import from Nationbuilder by Dave Brown - South Cambs Lib Dems
*/
const fs = require('fs');
const client = require('https');
require('dotenv').config();
const puppeteer = require('puppeteer');

// Pull in post data (importList)
const importList = require("./data/importnb.json");

// Create screenshots folder
if (!fs.existsSync("./screenshots")){
  fs.mkdirSync("./screenshots");
}
// Create Puppeteer cache folder to download CSS and page images to
if (!fs.existsSync("./cache")){
  fs.mkdirSync("./cache");
}
// Create Nationbuilder media folder to download featuredImages to
if (!fs.existsSync("./nb_media")){
  fs.mkdirSync("./nb_media");
}

// make sure URL_NEWS_LIST is set to the correct folder
const urls = {
  base: "https://beta.libdems.org.uk",
  login: "https://beta.libdems.org.uk/typo3/",
  news_list: process.env.URL_NEWS_LIST,
}

const fleet = {
  user_id: process.env.USER_ID,
  user_pass: process.env.USER_PASS,
  imageFolder: process.env.IMAGE_FOLDER
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
    console.log('Taking screenshot: ' + name);
    await page.screenshot({path: 'screenshots/' + name + '.png'});
  }
}

function init() {
  //console.log(process.env);
  
}

async function close(browser) {
  browser.close();
}

async function run() {
  return new Promise(async (resolve, reject) => {
    try {
      // Create browser and page, flags prevent CORS policy: No 'Access-Control-Allow-Origin' issue
      // See https://stackoverflow.com/questions/52129649/puppeteer-cors-mistake/52131823#66744065
      const browser = await puppeteer.launch({
        userDataDir: './cache',
        headless: true,
        devtools: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ]
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1920,
        height: 1080,
      });

      if(process.env.CONSOLE_DEBUG) {
        page.on('console', consoleObj => console.log(consoleObj.text()));
      }
      
      // Go to login page, login with credentials
      await page.goto(urls.login);
      await page.type('#t3-username', fleet.user_id);
      await page.type('#t3-password', fleet.user_pass);
      await page.click('#t3-login-submit');
      await page.waitForNavigation();
      
      // Save and set cookies
      const cookies = await page.cookies();
      // console.log(cookies);
      await page.setCookie(...cookies);
      
      // Run through import list
      for(let i=0; i<importList.length; i++) {
        let importItem = importList[i];
        console.log(`===> Importing [${i+1} / ${importList.length}]`);
        
        // Wrapped in try so entire script doesn't fall over
        try {
          // If featuredImageURL in row, try to download image to /nb_media/
          importItem.featuredImagePath = false;
          if(importItem.featuredImageURL) {
            let fileName = importItem.mediaName;
            let filePath = "./nb_media/" + fileName;
            importItem.featuredImageFileName = fileName;
            try {
              if (fs.existsSync(filePath)) {
                //file exists
                importItem.featuredImagePath = filePath;
              } else {
                // file doesn't exist, download
                await downloadImage(importItem.featuredImageURL, filePath).then(() => {
                  importItem.featuredImagePath = filePath;
                })
              }
            } catch(err) {
              console.error(err)
            }
          }
          
          // Determine if page exists and edit, or to create new page
          
          // Go to News List page
          await page.goto(urls.news_list, {waitUntil: 'networkidle0'});
          
          await takeScreenshot('news-listview', page, i);
          // Check if page exists against title (assumes titles are unique!)
          let searching_for_news = true;
          while(searching_for_news) {
            await page.waitForSelector("#typo3-contentIframe");
            
            searching_for_news = await page.evaluate( (importItem) => {
              let frameContext = document.getElementById('typo3-contentIframe').contentWindow.document;
              let $pages = frameContext.querySelectorAll('.col-title a');
              let $editElement = false;
              $pages.forEach($el => {
                if($el.textContent.trim() == importItem.title) {
                  $editElement = $el;
                }
              });
              if($editElement) {
                // Found page, click to move to edit it
                $editElement.click();
                console.log('Page already exists => editing');
                return false;
              } else {
                if(frameContext.querySelector('.page-item a[aria-label="Next"]')) {
                  // Not found in this list, if there are more pages, click the next link and repeat
                  frameContext.querySelector('.page-item a[aria-label="Next"]').click();
                  console.log('Page not found in this list => Searching another page in list');
                  return true;
                } else {
                  // Not found in this list and no more pages, we must create a new page
                  frameContext.querySelector('a[title="Create new news record"]').click();
                  console.log('No page exists => Create new page!');
                  return false;
                }
                
              }
            }, importItem);
            await page.waitForNavigation();
          }
        
          // Because everything in typo3 happens in iframes. Sigh
          let contentFrameHandle = await page.waitForSelector("#typo3-contentIframe");
          const contentFrame = await contentFrameHandle.contentFrame();
          await takeScreenshot('news-edit', page, i);

          let setValues = await page.evaluate((importItem) => {
            let frameWindow = document.getElementById('typo3-contentIframe').contentWindow;
            let frameContext = frameWindow.document;
            var setValues = [];
            var event_input = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            var event_change = new Event('change', {
                bubbles: true,
                cancelable: true,
            }); 
            
            var values = {
              title: importItem.title,
              teaser: importItem.excerpt,
              bodytext: importItem.content,
              path_segment: importItem.slug,
              datetime: importItem.date,
              author: importItem.author,
              notes: importItem.notes
            }
            
            // Find all inputs on the page across tabs that we can possible fill in
            let $inputs = frameContext.querySelectorAll('input, textarea');
            $inputs.forEach($el => {
              // Loop through. Focus on each element to initiate
              $el.focus();
              let name = $el.getAttribute("data-formengine-input-name");
              if(!name)
                name = $el.getAttribute("name");
              //console.log(name);
              let name_parts = name ? name.match(/\[([^\]]+)\]/g) : false;
              let ref = false;
              
              // Reduce to short hand ref []
              if(name_parts && name_parts.length && name_parts[name_parts.length-1]) {
                ref = name_parts[name_parts.length-1].replace("[", "").replace("]", "");
              }
              
              if(ref)
                console.log(ref);
              
              // Is this a value we're setting?
              if(ref && values[ ref ]) {
                $el.value = values[ ref ];
                console.log('--- Found ' + ref);
                setValues.push(ref);
                
                try {
                  $el.dispatchEvent(event_input);
                  $el.dispatchEvent(event_change);
                } catch(err) { console.error(err); }
                
                // WYSIWYGs get their own features
                if(ref == "bodytext") {
                  let id = $el.getAttribute("id");
                  frameWindow.CKEDITOR.instances[id].setData(values[ref]);
                  console.log('setting CKEditor value');
                }
                console.log('Setting value');
              }
            });
            
            return (setValues);
          }, importItem);
          await takeScreenshot('news-edit-valuesset', page, i);
          
          console.log('Following values found and set:');
          console.log(setValues);

          // Save the article so far
          await contentFrame.click('button[name="_savedok"]');
          await page.waitForNavigation();
          
          // If we have a featured Image to upload
          if(importItem.featuredImagePath) {
            // Switch to media tab
            await contentFrame.click('.typo3-TCEforms ul.nav li:nth-child(3) > a');
            await takeScreenshot('switch-to-media-tab', page, i);
            await contentFrame.waitForSelector('button[title="Add media file"]');
            await takeScreenshot('button-add-media-file', page, i);
            
            // Check if a featured image already exists attached to this page
            let imageAlreadyExists = await contentFrame.evaluate(() => {
              let el = document.querySelector("button.form-irre-header-cell")
              return el ? true : false;
            });
            console.log('imageAlreadyExists? ' + imageAlreadyExists);
            await takeScreenshot('media-tab', page, i);
            
            if(!imageAlreadyExists) {
              await takeScreenshot('not imageAlreadyExists', page, i);
            
              // Open media modal
              await contentFrame.click('button[title="Add media file"]');
              let mediaFrameHandle = await page.waitForSelector('[name="modal_frame"]');
              const mediaFrame = await mediaFrameHandle.contentFrame();
              await takeScreenshot('wait for image folder', page, i);
              // await mediaFrame.waitForSelector('g.node[title="Images"]');
              await mediaFrame.waitForSelector('g.node[title="' + fleet.imageFolder + '"]');
              // await takeScreenshot('media-modal-ready', page, i);
              
              // Switch to Images folder
              await mediaFrame.click('g.node[title="' + fleet.imageFolder + '"]');
              await takeScreenshot('media-modal-switchfolder', page, i);
              
              // Wait for upload form
              await mediaFrame.waitForSelector('input[type=file][name="upload_0[]"]');
              await takeScreenshot('media-modal-fileinputready', page, i);
              
              // Check if image already exists in list (n.b. recent only?)
              let imageAlreadyUploaded = await mediaFrame.evaluate((importItem) => {
                let el = document.querySelector(`.btn.btn-default[data-file-name="${importItem.featuredImageFileName}"]`)
                return el ? true : false;
              }, importItem);
              console.log('imageAlreadyUploaded? ' + imageAlreadyUploaded);
              
              if(!imageAlreadyUploaded) {
                // Upload image
                const fileUploadHandle = await mediaFrame.$('input[type=file][name="upload_0[]"]');
                await fileUploadHandle.uploadFile(importItem.featuredImagePath);
                await mediaFrame.click('.btn[type="submit"][value="Upload files"]')
                await mediaFrame.waitForSelector('.alert.alert-success');
                await takeScreenshot('media-modal-imageuploaded', page, i);
              }
              
              // Select image from list
              await mediaFrame.click(`.btn.btn-default[data-file-name="${importItem.featuredImageFileName}"]`);
              await page.click('.t3js-modal-close');
              // await takeScreenshot('media-modal-close', page, i);
              
              // Change dropdown to show in all views
              await contentFrame.waitForSelector('select[name$="[showinpreview]"]');
              // await takeScreenshot('media-tab-ready', page, i);
              
              await contentFrame.select('select[name$="[showinpreview]"]', "1");
              await takeScreenshot('media-tab-showinpreview', page, i);

            }

            // Add image title - too difficult to select!
            // let mediaFields = await contentFrame.$$('.t3js-form-field-eval-null-placeholder-checkbox');
            // await mediaFields[1].click('input.form-check-input');
            // await takeScreenshot('click-alt-text', page, i);
            // await contentFrame.waitForSelector('.t3js-form-field-eval-null-placeholder-checkbox+')

            /* 
            // Set aspect ratio - fails at present
            // aspect ratio 3x2 for List View, 16x9 for detail view (single article)
            // Check if aspect ratio is already correct
            let aspectRatio1 = await contentFrame.evaluate(() => {
              let el = document.querySelector(".t3js-image-manipulation-selected-ratio").textContent.trim();
              return el;
            });
            console.log('aspectRatio1=' + aspectRatio1);
            if(aspectRatio1 != '3:2') {
              // Open image manipulation modal
              await contentFrame.click('button.t3js-image-manipulation-trigger');
              console.log('after edit button click');
              await takeScreenshot('after edit button click', page, i);
              let modalCropper = await page.waitForSelector('.t3js-ratio-buttons');
              await takeScreenshot('ratio buttons loaded', page, i);
              console.log('ratio buttons loaded');
              // await modalCropper.click('input [name="aspectRatio-1-2"]');
              await modalCropper.evaluate(() => {
                let aspect = document.querySelector('[name="aspectRatio-1-2"]');
                aspect.click();
              });
              await takeScreenshot('select 3x2 aspect ratio', page, i);
              await modalCropper.click('button[data-method="save"]')
              await takeScreenshot('save aspect ratio', page, i);
              await page.click('.t3js-modal-close');
            }
            */
          }
          
          // All done, save that blog post!
          // await takeScreenshot('news-edit-presave', page, i);
          await contentFrame.click('button[name="_savedok"]');
          await page.waitForNavigation();
          await takeScreenshot('all done', page, i);
        
        } catch(e) {
          // If we caught a fatal error, rewind and try again
          console.log(e);
          console.log('FATAL ERROR :::: ...retrying this one...');
          // i--;
        }

      }
      
      close(browser);
      return resolve(false);
      
    } catch (e) {
      close(browser);
      return reject(e);
    }
  })

}


init();
run().then((setValues) => {
  console.log(setValues);

}).catch(console.err);