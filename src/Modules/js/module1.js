// Animated Background
VANTA.TOPOLOGY({
    el: "#animated-background",
    color: 0x888888,
    backgroundColor: 0x222222
})

let username = '\x1B[1;33mHuskyTerm@CASE\x1B[0m:$';

const socket = new WebSocket("ws://localhost:3000");
var term = new window.Terminal({
    fontSize: 14,
    cursorBlink: true,
    convertEol: true, // True if you want to convert newline characters to carriage return + newline
    wordWrap: true,
    theme: {
        background: '#444',  // Set the background color
        foreground: '#fff',  // Set the default foreground color
        cursor: 'rgba(255,255,255,0.5)', // Set the cursor color
        selection: 'rgba(255,255,255,0.3)'
      }
});

// Fake loading messages for the connection process
const loadingMessages = [
    "Establishing connection to remote server...",
    "Connected.\n",
];

let loadingMessageIndex = 0;

function displayLoadingMessage() {
    term.write('\r\n' + loadingMessages[loadingMessageIndex]);
    loadingMessageIndex++;
    if (loadingMessageIndex === loadingMessages.length) {
        initTerminal();
    } else {
        setTimeout(displayLoadingMessage, 1000); // Display next loading message after a delay
    }
}

// Instantiate the FitAddon
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

term.open(document.getElementById('terminal'));

// Call fit to adjust the terminal's size to the container
fitAddon.fit();

// Optional: Adjust terminal size on window resize
window.addEventListener('resize', () => {
    fitAddon.fit();
  });

const commands = {
    'hello': 'Hello, world!',
    'date': new Date().toString(),
    // Add more custom commands here
};

let command = '';

function initTerminal() {
    if (term._initialized) {
        return;
    }

    term._initialized = true;

    term.prompt = () => {
        term.write('\r\n' + username + ' '); // Display the username and prompt
        term.scrollToBottom(); // Scroll to the bottom to ensure the prompt is visible
    };
    prompt(term);

    term.onData(e => {
        switch (e) {
            case '\u0003': // Ctrl+C
                term.write('^C');
                prompt(term);
                break;
            case '\r': // Enter
                runCommand(term, command);
                command = '';
                break;
            case '\u007F': // Backspace (DEL)
                if (command.length > 0) {
                    term.write('\b \b');
                    command = command.substr(0, command.length - 1);
                    command = command.substr(0, command.length - 1);
                }
                break;
            case '\u0009':
                console.log('tabbed', output, ["dd", "ls"]);
                break;
            default:
                if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                    command += e;
                    term.write(e);
                }
        }
    });
}

function clearInput(command) {
    var inputLength = command.length;
    for (var i = 0; i < inputLength; i++) {
        term.write('\b \b');
    }
}

function prompt(term) {
    command = '';
    term.write('\r\n' + username + ' '); // Display the username and prompt
}

socket.onmessage = (event) => {
    term.write(event.data);
}

function runCommand(term, command) {
    if (command.length > 0) {
        term.write('\r\n'); // New line spacing for entered command

        if (commands.hasOwnProperty(command)) {
            term.write(commands[command]); // Display the output of the command
        } else {
            term.write('-bash: ' + command + ': command not found'); // Display an unrecognized command message
        }

        term.prompt(); // Display the prompt after command execution
        term.scrollToBottom(); // Ensure the prompt is visible after executing the command
        return;
    }
}

displayLoadingMessage();