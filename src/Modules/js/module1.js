// const terminalOutput = document.getElementById('terminalOutput');
// const ws = new WebSocket(`ws://localhost:3000`);

// ws.onopen = () => {
//     console.log(`Client: Client connected to the server.`);
//     adjustTerminalHeight();
// };

// ws.onmessage = (event) => {
//     terminalOutput.value += `${event.data}\n`;
//     adjustTerminalHeight();
// };

// ws.onclose = () => {
//     terminalOutput.value += 'Connection to the server closed.\n';
//     adjustTerminalHeight();
// };

// function adjustTerminalHeight() {
//     const terminalOutput = document.getElementById('terminalOutput');
    // const fixedHeight = 200; // Adjust the value as needed
//     terminalOutput.style.height = `${fixedHeight}px`;
//     terminalOutput.scrollTop = terminalOutput.scrollHeight;
// }

// function sendExampleCommand() {
//     const exampleCommands = document.getElementById('exampleCommands');
//     const selectedCommand = exampleCommands.value;

//     if (selectedCommand) {
//         console.log(`Client: Sending command to the server.`);
//         ws.send(selectedCommand);
//     } else {
//         console.error("Client: No option selected");
//     }
// } 