let username = '\x1B[1;33mHuskyTerm@CASE\x1B[0m:$';

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

// const commands = {
//     'hello': 'Hello, world!',
//     'date': new Date().toString(),
//     // Add more custom commands here
// };

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
                // Send command to the server
                sendCommandToServer(command);
                command = '';
                break;
            case '\u007F': // Backspace (DEL)
                if (command.length > 0) {
                    term.write('\b \b');
                    command = command.substr(0, command.length - 1);
                }
                break;
            default:
                if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                    command += e;
                    term.write(e);
                }
        }
    });
}

function prompt(term) {
    command = '';
    term.write('\r\n' + username + ' '); // Display the username and prompt
}

function sendCommandToServer(command) {
    fetch('http://localhost:3000/execute-command', { // Adjust the endpoint as needed
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: command }),
    })
    .then(response => response.text())
    .then(data => {
        term.write('\r\n' + data); // Display the response from the server
        term.prompt(); // Display the prompt after command execution
        term.scrollToBottom(); // Ensure the prompt is visible after executing the command
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

initTerminal();
