# Nationbuilder scraper
The Nationbuilder scraper consists of two Node.js scripts that can be used to scrape a Nationbuilder blog and import to Lib Dem Fleet.
- scrape_nb_blog.js uses Puppeteer to scrape a Nationbuilder blog and save the required data in a JSON file
- import_posts_nb.js reads the JSON and uses Puppeteer to create articles on a Fleet site, including attaching image media

The import_posts_nb.js file was based on code created by Stuart Lawrence from Elmbridge Lib Dems (Stuart Lawrence on the LibDems Tech Project Slack, developerstuart on GitHub) with minor changes required for the NB import. 

**The import_posts_nb.js script needs to use Fleet login credentials to work**. These details aren't passed back anywhere, but users should be careful when storing/sharing these files.

Both scripts are run on a terminal or command line interface and require the user to make edits to the .env files to match their requirements (see below). The scripts have been successfully used to export a combined total of one hundred posts from the South Cambs and Cambridgeshire NB sites and import them to the [South Cambs Fleet site](https://001b000000q0nehaan.fleet.praterraines.co.uk).

The files are being shared to allow local parties to import their Nationbuilder blog posts into Fleet articles. They are not being shared directly to the Fleet Slack channel as it is expected that users will have experience with a command line environment. During the running of the scripts, Typo3 regularly throws errors or bugs outside the control of the scripts, which may cause concern.

# Definitions
The following terms are used in this document to refer to content in Nationbuilder and Fleet.

- Blog or blog page - a page on Nationbuilder showing a list of posts
- Post - a page on Nationbuilder with a single news story, usually saved as a subpage in a blog
- News page - any page on Fleet that contains a News system content element to display a list of articles - for example, this could be the home page or a local news page
- Article - a news item in Fleet that was created in the News administration module
- Key image - an image linked to a Nationbuilder post
- Image media  - an image linked to an article and seen in list and detail view
- List view - a list of articles in Fleet generated by the News system content
- Detail view - a single article that has been opened after clicking on it from a news page

# Setup
The following sections describe the setting up steps required to download the scripts, packages and environment files.

## Create a project folder
This will be used to contain the scripts, the data file created from Nationbuilder and any downloaded images.

Create a folder on a local drive and download the following content from this repository:

- .env - contains the environment variables for the Nationbuilder and Fleet sites (see below)
- scrape_nb_blog.js - the script that scrapes the data from the Nationbuilder blog
- import_posts_nb.js - the script to import the NB blog posts into Fleet articles
- nb_blog_custom_template.html - custom template to use in the Nationbuilder blog while scraping
- README.md - this document
- data - a subfolder that will be used to save the import data file
- import_nb.example.json - an example file, found in the data folder, containing a single blog post scraped from the Cambridgeshire Nationbuilder site
- .gitattributes and .gitignore - used by GitHub, they can be ignored

## Install Node.js and npm
Node.js and npm are installed from the same file
- Download the relevant [Node.js installation file](https://nodejs.org/en/download/) for your operating system, choosing the LTS version
- Run the installation file, selecting default options and tick the box to automatically install the necessary tools
- After the install completes a window opens to install Python and Visual Studio, as instructed in the window, press any key to continue
- Press any key when asked to install Chocolatey
- Another window opens showing the progress of these installations, press ENTER to exit when asked (takes several minutes)

Both packages are now installed.

## Packages
Two additional modules are required from the npm repository.

To install them either run a command prompt or open a terminal session in a code editor. I use Visual Studio Code, which can be downloaded for free from [Microsoft](https://visualstudio.microsoft.com/downloads/).

Navigate to the project folder created earlier and run the following commands.
- npm install puppeteer
- npm install dotenv

# Configuration

The following steps are required to prepare to run the scripts, so they read the correct Nationbuilder blog and can log in to the correct Fleet site.

## Review the Nationbuilder blog
Scroll through the blog posts and decide on the earliest date that will be imported, this value will be used in the next step. I originally went for just before the 2019 general election, then revised it to the start of 2019 as there were a few posts that may be worth keeping. They can always be hidden or deleted in Fleet.

## Edit the .env file
This is the only text file that needs to be edited. It contains a number of variables to configure the import to the correct sites.

![image](https://user-images.githubusercontent.com/96742305/200948459-06f1e69a-7398-4711-a10f-fd5526a4b7c9.png)

The lines beginning with \# are comments, the variable names are the ones in capitals.

### USER_ID
This is the username for editing the Fleet site. It is typically the user’s Lib Dem membership number.

### USER_PASS
The password for the username entered above. If you share the .env file with someone else, make sure this value is deleted.

### URL_NEWS_LIST
The link to the News Admin folder in Fleet. Select News Administration from the Fleet menu and select the required folder where the articles should be created. By default there is a folder with the site name in the Data folder. If there will be several news feeds in the site, additional subpages can be added to hold the articles. The image below shows the default folder for South Cambridgeshire and two subpages for Pippa Helyings and Cambridgeshire.

![image](https://user-images.githubusercontent.com/96742305/200943381-01196f9d-716a-483e-be6a-47ae98f93c94.png)

### NB_NEWS_LIST
The link to the blog page in Nationbuilder that will be scraped.

### CONSOLE_DEBUG
A flag that can be set to 1 to enable console messages or 0 to disable them.

### SCREENSHOT_DEBUG
A flag that can be set to 1 to enable screenshots for debug to be taken during the import or 0 to disable them. It is recommended to keep this at 1, setting to 0 can result in images not being uploaded to Fleet and linked to the articles.

### IMAGE_FOLDER
The folder in Fleet where the images will be uploaded. The folder can be structured in any way required. It is recommended that separate folders are created for the Nationbuilder import. If two or more Nationbuilder blogs are being imported, the folders must have unique names in Fleet even if they are in different parent folders.

![image](https://user-images.githubusercontent.com/96742305/200944330-cad9cf30-d108-4606-8292-6bc1572e69a7.png)

### IMPORT_NOTES=Imported from South Cambs Nationbuilder
A text string that will be saved on the Notes tab of each imported article. Useful to see where the article came from at a future date.

### DEFAULT_NB_MEDIA=0
A flag that can be set to 1 to enable a default image to be added if there is no key image or embedded image in the Nationbuilder post.

### DEFAULT_NB_MEDIA_URL
The link to the default image if required. It is recommended to save this in the Files tab of the Nationbuilder blog.

### DEFAULT_NB_MEDIA_ALT=South_Cambs_Logo_with_margin_1600x900.png
Alt text is shown on a webpage if something causes the image to fail to display when viewed by a site visitor. Often this is the filename.

### DEFAULT_NB_MEDIA_TITLE=Click to open the news article
The title will be seen by visitors if they hover over the image in the News page.

### NB_FIRST_DATE
The earliest date of posts to scrape. It needs to be written in yyyy-mm-dd format, for example 2018-12-31.

## Nationbuilder custom template
The scraper requires all the posts to be visible on one blog page with no need to select the next page to get more. This requires two changes to be made in Nationbuilder. The changes will only need to be active for a short time and the blog page settings can be returned to their previous values afterwards. The chances of anyone looking at the blog page in this time are very low, most visitors will only be looking at the recent posts on the home page.

Sign in to Nationbuilder and select *Edit* for the blog page.

![image](https://user-images.githubusercontent.com/96742305/201180596-0fe1310e-a52e-42d6-8113-24d85bafb0f1.png)

First the blog needs to be configured to show a large number of posts per page.

- Select the *Settings* tab for blog
- Change the *Number of posts to show at a time* setting to a large number such as 100 - it doesn't matter if it's too high
- Save settings
- Open the live blog page and check it is now showing a large number - if it isn't try another save

By default the blog page only shows *title*, *author*, *date* and anything in *Before the flip*. It doesn't show the *key_image* or anything from *After the flip*. To show these a custom template is used.

![image](https://user-images.githubusercontent.com/96742305/201183945-a41233c9-932c-441d-aa50-d57ed73e0d80.png)

- Select the *Template* tab for the blog
- If the blog page is not currently using a custom template, click on *Create a custom template*
- If the page is already using a custom template, select the whole code and save it somewhere so it can be restored later
- Delete the existing code from the template
- Open the nb_blog_custom_template.html file and copy everything
- Paste the code into the Nationbuilder editor
- Click on *Save and publish changes*
- Refresh the live page

The blog page should now be showing all the data from before, plus the *key_image* and *After the flip section*.

![image](https://user-images.githubusercontent.com/96742305/201184477-1b3dd81f-934a-4a8b-ba0d-03e169501c54.png)

If the key image was also embedded in the post it will appear twice. This will be resolved during the scraping process.

# Scraping the blog

Now the blog will be scraped using the scrape_nb_blog.js script and saved in a text file in JSON format. This typically takes less than one minute for around 100 posts. Information on JSON can be found on the [W3Schools website](https://www.w3schools.com/whatis/whatis_json.asp).

The script performs the following steps.

- Reads all the html code that is part of the blog posts from the blog page - it ignores other content such as the sidebar or social media buttons
- Loops through all the posts, gathering the required data from each individual post as follows:

  - Checks the date on the post and ignores it if it's earlier than the value given as NB_FIRST_DATE in the .env file
  - If it is equal to or more recent than NB_FIRST_DATE it reads the *slug*, *title* and *author*
  - As Nationbuilder doesn't provide the time, it is set to one minute after midnight
  - Reads the content both *before the flip* and *after the flip*
  - Removes the horizontal line placed at the end of the content by Nationbuilder
  - Removes any empty paragraphs - `<p>&nbsp;</p>`
  - If there is a key image it reads the link, title and alt
  - If there is no key image it looks for images embedded in the content and saves the data for the first one it finds
  - If there is no key image or embedded image it uses the default image data from the .env file if it is enabled
  - If there are no embedded images or default image it leaves the image data fields blank (null)
  - Removes *Read more* from the end of the excerpt
  - Trims the excerpt to one sentence
  - Truncates the excerpt to 150 characters
  - Saves the data

To run the script enter the following command from a command line or terminal.

`node scrape_nb_blog`

While the script is running it displays a printout of the data that has been scraped and ends with a message saying Data written to file. The data file is called import_nb.json and can be found in the data folder for your project.

When it has completed, open the import_nb.json file. Each post will start something like this.

    {
        "slug": "/joint_administration_agreement",
        "title": "Lib Dems agree joint administration at Cambridgeshire County Council",
        "date": "00:01 14-5-2021",
        "author": "Maya Nakamura",
        "content": "\n            <p>Liberal Democrat, ...
 
 And will end
 
    _agreement_2021_FINAL.pdf?1620984611\">here</a></p>\n                      ",
        "featuredImageURL": "https://assets.nationbuilder.com/cambridgelibdems/pages/5179/attachments/original/1620990703/key_county_agreement_signed.JPG?1620990703",
        "imageTitle": "Lib Dems agree joint administration at Cambridgeshire County Council",
        "imageAlt": "Lib Dems agree joint administration at Cambridgeshire County Council",
        "excerpt": "Liberal Democrat, Labour, and Independent Groups on Cambridgeshire County Council have hammered out an agreement for a Joint Administration to run the...",
        "notes": "Imported from Cambridgeshire Nationbuilder",
        "mediaName": "key_county_agreement_signed.JPG"
    }

There are opening and closing square brackets at the start and end of the file.

# Importing to Fleet
The import to Fleet is done using the import_posts_nb.js script. Depending on the number and size of the images, this can take some time, typically about half a minute per imported post when first run.

The script performs the following functions

- Reads the import_nb.json file created by scrape_nb_blog
- Creates folders for screenshots, Puppeteer browser cache and Nationbuilder images in the project folder if they don’t exist
- Signs into Fleet
- Accepts cookies if requested by Fleet
- Loops through each post in the file performing the following steps:
  - Downloads the image and saves it locally to the .\nb_media folder
  - Checks if the post has already been saved as an article
  - If the article exists it goes into edit mode
  - Creates a new article if it doesn't exist
  - Enters the data for the *Header* (title), *Teaser* (excerpt), *Text* (content), S*peaking URL path segment* (slug), *Date & Time* (date), *Author Name* (author),  *Publish Date* (date) and *Notes* (notes)
  - Checks if there is an image
  - If the image is not already in the named image folder, it uploads it to Fleet
  - Selects the image from Fleet and adds it to the article
  - Changes the *Show in views dropdown* to *Show in all views*
  - Takes screenshots from the Puppeteer browser at various steps in the process and saves them locally to the ./screenshots folder
  - Saves the article

While the script is running the output will show a lot of messages. These include `Cannot read properties of undefined (reading 'options')` and `Initializing all date pickers globally has been marked as deprecated. Please pass a specific element.`. Both of these can be ignored. As long as it shows it is working its way through the import it is running fine.

`===> Imported article 23
===> Importing [24 / 37]`

When it has finished it shows Import completed.

`Import completed`

# Restore Nationbuilder settings

Having completed the import, the blog in Nationbuilder can be restored to the previous settings.

- Sign in to Nationbuilder
- Select *Edit* for the blog page
- Select *Settings* tab for the blog
- Change the *Number of posts to show at a time* setting to the original value
- Save settings
- Select the *Template* tab
- If the page was using a custom template, select the whole code, delete it, paste the custom code back that was saved previously and then click on *Save and publish changes*
- If the page was not using a custom template, scroll to the bottom and click on *Delete custom template*
- A confirmation window opens, click on *Delete custom template*
- Refresh the live page to verify it is no longer showing the key image or the full content

The blog page should now be restored to the previous settings.

# Post restoration checks
Looking in the Fleet editor all the imported pages should now be seen in News Administration.

![image](https://user-images.githubusercontent.com/96742305/201426896-c0b4c0d6-caea-4172-9a3e-d3cc3cdf15d9.png)

Similarly Looking in Filelist should show the imported key images or the first image from a post if there was no key image.

![image](https://user-images.githubusercontent.com/96742305/201427159-53b9885e-3215-42cd-9e01-85ee2d49dafe.png)

Open the live news page and refresh it to review the articles.

![image](https://user-images.githubusercontent.com/96742305/201427493-fba800cb-aaf4-4c2a-b7f8-f3923b42bf16.png)

If a large number of articles have been imported, there will be buttons at the bottom of the page to navigate to further pages.

![image](https://user-images.githubusercontent.com/96742305/201427680-7944c929-1f56-4841-9162-a583ca20ab73.png)

Review how the imported image looks in the news page. If they weren't 1200x628 in Nationbuilder they may have been cropped or resized in Fleet to fit. This could include cropping heads or text. If needed, go into Fleet and edit them.

![image](https://user-images.githubusercontent.com/96742305/201428498-c7c0856a-53fd-45ab-acce-40b8868ce4c1.png)

Finally ask someone else from the campaign/communications team in the local party to review the articles to check if any are no longer required. They can be either deleted or hidden in Fleet.

# Re-running scrape_nb_blog.js
The script might need to be re-run if different Nationbuilder blog pages need to be scraped and imported. In my case South Cambridgeshire and Cambridgeshire were hosted in different Nationbuilder nations.

If the script is re-run for a different blog it will require the settings to be changed for the .env file and it will overwrite the import_nb.json. It is recommended to copy the existing .env and import_nb.json, saving them so they can be used again if required.

Make changes to the .env file as required. All settings should be reviewed, but the likely ones to change include the following:

- USER_PASS - if you are helping another local party or have a second Fleet site
- URL_NEWS_LIST - if the articles are to be created in a different news folder
- NB_NEWS_LIST - if the NAtionbuilder blog is different
- IMAGE_FOLDER - if the images are to be saved in a different folder
- IMPORT_NOTES - if the posts came from a different Nationbuilder blog
- DEFAULT_NB_MEDIA_URL - if the default image is changed
- DEFAULT_NB_MEDIA_ALT - if the default image is changed
- DEFAULT_NB_MEDIA_TITLE - if required
- NB_FIRST_DATE - if this is different

# Re-running import_posts_nb.js
The import can be re-run if needed, for example if the script is changed at some point to add categories. The script checks to see if the existing article and image already exist and edits them instead of creating new content. It looks for an article based on its title so they need to be unique. If two articles have the same title the script will overwrite the second one.

# Future enhancements
These are updates that may be made to the scripts in future.

## Categories
As mentioned above, the script doesn't currently set categories. When local categories become available, the script may be modified to enable them to be added to the articles that have been imported.

## Finding why the code needs to take screenshots for the image imports to work
The screenshots were originally added to the code for debugging purposes, but it has been found the blog images don't all get imported to Fleet if the screenshots are turned off. By leaving the screenshots it adds a small delay between steps during the image import, which is enough for it to succeed. It would be preferable if the screenshots could be disabled. If anyone can find the change needed to the code to fix the image import, let me know.

# Comments and feedback

Comments, feedback and improvements welcome. You will find me as Dave Brown on the LibDems Tech Project Slack, Daveb4444 on GitHub).
