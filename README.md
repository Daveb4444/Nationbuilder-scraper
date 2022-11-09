# Nationbuilder scraper
The Nationbuilder scraper consists of two Node.js scripts that can be used to scrape a Nationbuilder blog and import to Lib Dem Fleet.
- scrape_nb_blog13.js uses Puppeteer to scrape a Natiobuilder blog and save the required data in a JSON file
- import_posts_nb.js reads the JSON and uses Puppeteer to create articles on your Fleet site including attaching media

The import_posts_nb.js file was based on code created by Stuart Lawrence from Elmbridge Lib Dems (developerstuart on GitHub) with minor changes to cope with the NB inport. 

**The import_posts_nb.js script needs to use your Fleet login credentials to work**. These details aren't passed back anywhere, but you should be mindful when storing/sharing these files.

Both scripts are run on a terminal or command line interface and require the user to make edits to the .env files to match their requirements (see below). The scripts have been successfully used to export a combined total of one hundred blog posts from the South Cambs and Cambridgeshire NB sites and import them to the [South Cambs Fleet site](https://001b000000q0nehaan.fleet.praterraines.co.uk).

The files are being shared to allow local parties to import thier Nationbuilder blog posts into Fleet articles. They are not being shared directly to the Fleet Slack channel as users who don't have experience with a command line environment may have difficulties. During the running of the scripts, Typo3 regularly throws errors or bugs outside the control of this script, which may cause concern.

#Setup
A number of packages are required to run the scripts including Node.js, npm, puppeteer and dotenv.
##Install Node.js and npm
Node.js and npm are installed from the same file
- [Downoad Node.js](https://nodejs.org/en/download/), choosing the LTS version
- Run the installer, selecting default options and tick the box to automatically install the necessary tools
- After the install completes a window opens to install Python and Visual Studio, as instrcuted in the window, press any key to continue
- Press any key again to install Chocolatey
- Another window opens showing the progress of these installs, press ENTER to exit when asked
Both packages are now installed.

##Packages
