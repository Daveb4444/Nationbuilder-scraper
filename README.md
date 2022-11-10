# Nationbuilder scraper
The Nationbuilder scraper consists of two Node.js scripts that can be used to scrape a Nationbuilder blog and import to Lib Dem Fleet.
- scrape_nb_blog13.js uses Puppeteer to scrape a Natiobuilder blog and save the required data in a JSON file
- import_posts_nb.js reads the JSON and uses Puppeteer to create articles on your Fleet site including attaching media

The import_posts_nb.js file was based on code created by Stuart Lawrence from Elmbridge Lib Dems (developerstuart on GitHub) with minor changes to cope with the NB inport. 

**The import_posts_nb.js script needs to use your Fleet login credentials to work**. These details aren't passed back anywhere, but you should be mindful when storing/sharing these files.

Both scripts are run on a terminal or command line interface and require the user to make edits to the .env files to match their requirements (see below). The scripts have been successfully used to export a combined total of one hundred blog posts from the South Cambs and Cambridgeshire NB sites and import them to the [South Cambs Fleet site](https://001b000000q0nehaan.fleet.praterraines.co.uk).

The files are being shared to allow local parties to import thier Nationbuilder blog posts into Fleet articles. They are not being shared directly to the Fleet Slack channel as users who don't have experience with a command line environment may have difficulties. During the running of the scripts, Typo3 regularly throws errors or bugs outside the control of this script, which may cause concern.

# Definitions
The following terms are used in this document to refer to page types in NAtionbuilder and Fleet.

- Blog - a page on Nationbuilder showing a list of posts
- Post - a page on Nationbuilder with a single news story, usually saved as a subpage in a blog
- News page - any page on Fleet that contains a News system content element to display a list of articles - for example, this could be the home page or a local news page
- Article - a news item in Fleet that was created in the News administration module

# Setup
The following sections describe the setting up steps to downolad the scripts, packages and envirnoment files.

## Create a project folder
This will be used to contain the scripts, the data file created from Nationbuilder and any dowwnloaded images.

Create a folder and download the following content from this repository. This will include the following items:
- .env - contaions the environemnt variables for the Nationbuilder and Fleet sites (see below)
- import_posts_nb.js - the script to import the NB blog posts into Fleet articles
- scrape_nb_blog.js - the script that scrapes teh data from teh Nationbuilder blog
- nb_blog_custom_template.html - cusomt temple to use in the Nationbuilder blog while scraping
- README.md - this document
- data - a folder that will be used to save the import data file
- import_nb.example.json - an example file, found in the data folder, containing a sinlge blog post scraped from the Cambridgeshire Nationbuilder site
- .gitattributes and .gitignore - used by GitHub, they can be ignored

## Install Node.js and npm
Node.js and npm are installed from the same file
- [Downoad Node.js](https://nodejs.org/en/download/), choosing the LTS version
- Run the installer, selecting default options and tick the box to automatically install the necessary tools
- After the install completes a window opens to install Python and Visual Studio, as instrcuted in the window, press any key to continue
- Press any key again to install Chocolatey
- Another window opens showing the progress of these installs, press ENTER to exit when asked (takes sevaeral minutes)
Both packages are now installed.

## Packages
Two additional modules are required form the npm repository.

To install them either run a command prompt or open a terminal session in a code editor. I use Visual Studio Code, which can be downlaoded for free from [Microsoft](https://visualstudio.microsoft.com/downloads/).

Navigate to the project folder created earlier and run the following commands.
- npm install puppeteer
- npm install dotenv

# Configuration

The following steps are required to prepare to run the scripts, so they read the correct Nationbuilder blog and can log in to the correct Fleet site.

## Review the Nationbuilder blog
Scroll through the blog posts and decide on the earliest date that will be imported, this value will be used in the next step. I originally went for just before the 2019 general election, then revised it to the start of the year as there were a few posts that may be worth keeping. They can always be hidden or deleted in Fleet.

## Edit the .env file
This is the only text file that needs to be edited. It contains a number of variables to configure the import to the correct sites.

![image](https://user-images.githubusercontent.com/96742305/200948459-06f1e69a-7398-4711-a10f-fd5526a4b7c9.png)

The lines beginning with \# are comments, the variabel names are the ones in capitals.

### USER_ID
The is the username for editing the Fleet site. It is typically the users Lib Dem meberrship number.

### USER_PASS
The password for the username entered above. If you share the .env file ewith someone else, make sure this value is deleted.

### URL_NEWS_LIST
The link to the News Admin folder in Fleet. Select News Admnstation from teh Fleet menu adn select the required folder where the articles should be created. By default there is a folder with the site name in the Datafolder. If there will be several news feeds in the site, additionl subpages can be added to hold the articles. The image below shows the default folder for South Cambridgeshire and two subpages for Pippa Helyings and Cambridgeshire.

![image](https://user-images.githubusercontent.com/96742305/200943381-01196f9d-716a-483e-be6a-47ae98f93c94.png)

### NB_NEWS_LIST
The link to the home page of the Nationbuilder blog to be scraped.

### CONSOLE_DEBUG
A flag that can be set to 1 to enable console messages or 0 to disable them.

### SCREENSHOT_DEBUG
A flag that can be set to 1 to enable screenshots to be taken during the import or 0 to disable them. It is recommended to keep this at 1, setting to 0 can result in images not being linked to the articles.

### IMAGE_FOLDER
The folder in Fleet where the images will be uploaded. This can be structured in any way required. It is recommended that separate folders are created for the Nationbuilder import. If two or more Nationbuilder blogs are being imported, the folders must have uniques names in Fleet even if they are in differnet parent folders.

![image](https://user-images.githubusercontent.com/96742305/200944330-cad9cf30-d108-4606-8292-6bc1572e69a7.png)

### IMPORT_NOTES=Imported from South Cambs Nationbuilder
A text string that will be saved on the Notes tab of each imported article. Useful to see where teh article came from at a future date.

### DEFAULT_NB_MEDIA=0
A flag that can be set to 1 to enable a default image to be added if there is no key image in embedded image in the NAtionbuilder post.

### DEFAULT_NB_MEDIA_URL
The link to the default image if required. It is recommended to save this in the Files tab of the Nationbuilder blog.

### DEFAULT_NB_MEDIA_ALT=South_Cambs_Logo_with_margin_1600x900.png
Alt text is shown if somehting causes the image to fail to display when viewed by a site visitor. Often this is the filename.

### DEFAULT_NB_MEDIA_TITLE=Click to open the news article
The title will be seen by visitors if they hover over the image in the News page.

### NB_FIRST_DATE
The date earliest date of posts to scrape.

## Nationbuilder custom template
The scraper requires all the posts to be visible on one blog page with no need to select the next page to get more. This requires two changes to be made in Nationbuilder. The changes will only require to be active for a short time and the blog page settings can be returned to their previous values afterwards. The chances of anyone looking at the blog page in this time are very low, most will only be looking at the recent posts on the homme page.

Sign in to Nationbuilder and select Edit for the blog page.

![image](https://user-images.githubusercontent.com/96742305/201180596-0fe1310e-a52e-42d6-8113-24d85bafb0f1.png)

First the blog page needs to be configured to show a large number of posts per page.

- Select the blog settings tab
- Change the Number of posts to show at a time setting to a large number such as 100 - it doesn't matter if it's too high
- Save settings
- Open the live blog page and check it is now showing a large number - if it isn't try another save

By default the blog page only shows title, author, date and anything in Before the flip. It doesn't show the key_image or anything from After the flip. To show these a custom template is used template.

![image](https://user-images.githubusercontent.com/96742305/201183945-a41233c9-932c-441d-aa50-d57ed73e0d80.png)

- Select the Template tab
- If the blog page is not currently using a custom tempalte, clikc on Create a customg template
- If the page is already using a cusomt tempalte, select the whole code and save it somewhere so it can be restored later
- Delete the existing code from the template
- Open the nb_blog_custom_template.html file and copy everything
- Paste the code into the Nationbuilder editor
- Click on Save and publish changes
- REfresh the live page

The blog page should now be showing all the data from before, plus the key_image and After the flip section.

![image](https://user-images.githubusercontent.com/96742305/201184477-1b3dd81f-934a-4a8b-ba0d-03e169501c54.png)

If the key image was also included in the post it will appear twice. This will be resolved during the scraping process.

# Scraping the blog

Now the blog will be scraped and the content saved in a text file in JSON format. Information on JSON can be found on the [W3Schools website](https://www.w3schools.com/whatis/whatis_json.asp).

From a command line or terminal enter the following command

`code` node scrape_nb_blog
