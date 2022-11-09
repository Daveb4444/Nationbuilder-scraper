# Nationbuilder scraper
The Nationbuilder scraper consists of two Node.js scripts that can be used to scrape a Nationbuilder blog and import to Lib Dem Fleet.
- scrape_nb_blog13.js uses Puppeteer to scrape a Natiobuilder blog and save the required data in a JSON file
- import_posts_nb.js reads the JSON and uses Puppeteer to create articles on your Fleet site including attaching media

The import_posts_nb.js file was based on code created by Stuart Lawrence from Elmbridge Lib Dems (developerstuart on GitHub) with minor changes to cope with the NB inport. 

**The import_posts_nb.js script needs to use your Fleet login credentials to work**. These details aren't passed back anywhere, but you should be mindful when storing/sharing these files.

Both scripts are run on a terminal or command line interface and require the user to make edits to the .env files to match their requirements (see below). The scripts have been successfully used to export a combined total of one hundred blog posts from the South Cambs and Cambridgeshire NB sites and import them to the [South Cambs Fleet site](https://001b000000q0nehaan.fleet.praterraines.co.uk).

The files are being shared to allow local parties to import thier Nationbuilder blog posts into Fleet articles. They are not being shared directly to the Fleet Slack channel as users who don't have experience with a command line environment may have difficulties. During the running of the scripts, Typo3 regularly throws errors or bugs outside the control of this script, which may cause concern.

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

The following steps are required to prepare to run the scripts, so they read the correct NAtionbuilder blog and can log in to the correct Fleet site.

## Review the Nationbuilder blog
At this stage it is not necessary to review every post, but it is useful to decide the earliest date for the posts that are required.

## 
