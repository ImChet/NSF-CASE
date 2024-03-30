# NSF-CASE

### Getting Started
1. Install Node.js [here](https://nodejs.org/en/download). Node.js should come with Node Package Manager (npm). To verify they are install run the follow commands in a terminal:

    ```
    node -v
    npm -v
    ```
2. Install Docker Desktop [here](https://www.docker.com/products/docker-desktop/).
3. Clone the repository to your local device using GUI or command line. \
    a. Install dependances (**make sure you are in `NSF-CASE/`**):

        `npm i`
        
### Additional Notes from Mia
* Typically the public/ folder contains the assets (pictures and such). The src/ folder will hold all the code.
* Add any files you do not need tracked to the `.gitignore` file. 
* Link to repo of JavaScript library I'm using for simulating terminal: [xterm.js](https://github.com/xtermjs/xterm.js)
* Using official Michigan Tech colors link [here](https://www.mtu.edu/umc/resources/brand/#palette)

### Existing bugs
* Ran into some issues with bash scripts appending `\r` at the end of everyline.
