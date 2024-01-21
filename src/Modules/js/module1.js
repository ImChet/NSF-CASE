// // Assuming xterm.js is included and Terminal is available
// import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";
// import '../../../node_modules/xterm/css/xterm.css';

// const terminal = new Terminal();
// const fitAddon = new FitAddon();
// terminal.loadAddon(fitAddon);
// terminal.open(document.getElementById('terminalContainer'));
// fitAddon.fit();


// terminal.onData(data => {
//     // // Parse the command from the input data
//     const command = data.trim();

//     // Define custom commands and their outputs
//     const commands = {
//         'hello': 'Hello, world!',
//         'date': new Date().toString(),
//         // Add more custom commands here
//     };

//     // // Check if the command is defined, and display its output
//     if (commands.hasOwnProperty(command)) {
//         terminal.write('\r\n' + commands[command]);
//     } else {
//         terminal.write('\r\nUnknown command\r\n');
//     }
// });

// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

