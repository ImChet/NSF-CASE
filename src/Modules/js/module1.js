const terminalOutput = document.getElementById('terminalOutput');
const ws = new WebSocket(`ws://localhost:3000`);

ws.onopen = () => {
    console.log(`Client: Client connected to the server.`);
    adjustTerminalHeight();
};

ws.onmessage = (event) => {
    terminalOutput.value += `${event.data}\n`;
    adjustTerminalHeight();
};

ws.onclose = () => {
    terminalOutput.value += 'Connection to the server closed.\n';
    adjustTerminalHeight();
};

function adjustTerminalHeight() {
    const terminalOutput = document.getElementById('terminalOutput');
    const fixedHeight = 200; // Adjust the value as needed
    terminalOutput.style.height = `${fixedHeight}px`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function sendExampleCommand() {
    const exampleCommands = document.getElementById('exampleCommands');
    const selectedCommand = exampleCommands.value;

    if (selectedCommand) {
        console.log(`Client: Sending command to the server.`);
        ws.send(selectedCommand);
    } else {
        console.error("Client: No option selected");
    }
}

const moduleDescription = {
    title: {
        text: "Module 1: NMAP",
        style: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#ffd700",
        fontStyle: "normal",
        textDecoration: "none"
        }
    },
    sections: [
        {
        description: {
            text: `Welcome to the world of <a href='https://mtu.edu' style='color: #ffd700; text-decoration: underline;'>cybersecurity espionage</a>!`,
            style: {
            fontSize: "18px",
            fontWeight: "normal",
            color: "#ffd700",
            fontStyle: "bold",
            textDecoration: "none"
            }
        },
        bulletPoints: [
            {
            text: "Scan the network for hidden weaknesses.",
            style: {
                fontSize: "16px",
                fontWeight: "normal",
                color: "white",
                fontStyle: "normal",
                textDecoration: "none"
            }
            },
            {
            text: "Retrieve critical data without leaving a trace.",
            style: {
                fontSize: "16px",
                fontWeight: "normal",
                color: "white",
                fontStyle: "normal",
                textDecoration: "none"
            }
            },
            {
            text: "Communicate through a secure terminal interface.",
            style: {
                fontSize: "16px",
                fontWeight: "normal",
                color: "white",
                fontStyle: "normal",
                textDecoration: "none"
            }
            }
        ]
        },
        {
        description: {
            text: "In this thrilling mission, you'll become a covert operative tasked with infiltrating an ultra-secure network. Your trusty ally on this adventure is the NMAP terminal, a powerful tool for scanning networks and uncovering vulnerabilities.",
            style: {
            fontSize: "18px",
            fontWeight: "normal",
            color: "white",
            fontStyle: "normal",
            textDecoration: "none"
            }
        },
        bulletPoints: []
        },
        {
        description: {
            text: "Your success hinges on your ability to decipher NMAP results and answer questions that will guide you deeper into this high-stakes digital adventure.",
            style: {
            fontSize: "18px",
            fontWeight: "normal",
            color: "white",
            fontStyle: "normal",
            textDecoration: "none"
            }
        },
        bulletPoints: []
        }
    ],
    summary: {
        text: "Summary of the module goes here.",
        style: {
        fontSize: "16px",
        fontWeight: "normal",
        color: "#ffd700",
        fontStyle: "italic",
        textDecoration: "underline"
        }
    }
    };

    // Function to apply text styles based on the style object
    function applyTextStyles(element, style) {
    element.style.fontSize = style.fontSize;
    element.style.fontWeight = style.fontWeight;
    element.style.color = style.color;
    element.style.fontStyle = style.fontStyle;
    element.style.textDecoration = style.textDecoration;
    }

    // Function to create a section with description and bullet points
    function createSection(section) {
    const sectionElement = document.createElement('div');
    sectionElement.classList.add('moduleSection');

    if (section.description) {
        const descriptionElement = document.createElement('div');
        descriptionElement.innerHTML = section.description.text;
        applyTextStyles(descriptionElement, section.description.style);
        sectionElement.appendChild(descriptionElement);
    }

    if (section.bulletPoints && section.bulletPoints.length > 0) {
        const bulletListElement = document.createElement('ul');
        section.bulletPoints.forEach((bulletPoint) => {
        const listItemElement = document.createElement('li');
        listItemElement.textContent = bulletPoint.text;
        applyTextStyles(listItemElement, bulletPoint.style);
        bulletListElement.appendChild(listItemElement);
        });
        sectionElement.appendChild(bulletListElement);
    }

    return sectionElement;
    }

    // Populate module description elements
    const titleElement = document.getElementById('moduleTitle');
    titleElement.textContent = moduleDescription.title.text;
    applyTextStyles(titleElement, moduleDescription.title.style);

    const moduleSectionsContainer = document.getElementById('moduleSections');
    moduleDescription.sections.forEach((section) => {
    const sectionElement = createSection(section);
    moduleSectionsContainer.appendChild(sectionElement);
    });

    // Populate summary
    const summaryElement = document.createElement('div');
    summaryElement.innerHTML = moduleDescription.summary.text;
    applyTextStyles(summaryElement, moduleDescription.summary.style);
    moduleSectionsContainer.appendChild(summaryElement);

const questions = [
    {
        id: "textAnswer1",
        question: "What is the lowest port open?",
        type: "text",
        answer: "21"
    },
    {
        id: "singleChoiceAnswer1",
        question: "What is the purpose of NMAP?",
        type: "singleChoice",
        options: [
            "Network scanning",
            "Web development",
            "Data analysis",
            "Video editing"
        ],
        answer: "Network scanning"
    },
    {
        id: "multipleChoiceAnswer1",
        question: "Select all true statements about NMAP:",
        type: "multipleChoice",
        options: ["NMAP can perform host discovery", "NMAP is a database management tool", "NMAP can be used to identify services on a network"],
        answers: ["NMAP can perform host discovery", "NMAP can be used to identify services on a network"]
    },
    {
        id: "dropdownAnswer2",
        question: "What service is running on port 21 over TCP?",
        type: "dropdown",
        options: ["HTTPS", "FTP", "SFTP"],
        answer: "FTP"
    }
];

// Flag to track whether the return button has been created
let returnButtonCreated = false;

function generateQuestions() {
    const questionsContainer = document.getElementById("questionsContainer");

    questions.forEach((questionData) => {
        const questionElement = document.createElement("div");
        questionElement.className = "mb-3"; // Bootstrap margin class

        const label = document.createElement("label");
        label.className = "form-label text-light"; // Bootstrap label class
        label.innerText = questionData.question;
        questionElement.appendChild(label);

        switch (questionData.type) {
            case "text":
                const textInput = document.createElement("input");
                textInput.setAttribute("type", "text");
                textInput.className = "form-control"; // Bootstrap input class
                textInput.setAttribute("id", questionData.id);
                textInput.setAttribute("name", questionData.id);
                questionElement.appendChild(textInput);
                break;
            case "dropdown":
                const select = document.createElement("select");
                select.className = "form-select"; // Bootstrap select class
                select.setAttribute("id", questionData.id);
                select.setAttribute("name", questionData.id);

                questionData.options.forEach((option) => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });

                questionElement.appendChild(select);
                break;
            case "singleChoice":
                questionData.options.forEach((option) => {
                    const labelElement = document.createElement("label");
                    labelElement.className = "form-check-label text-light"; // Bootstrap class for label
                    labelElement.setAttribute("for", `${questionData.id}-${option}`);
                    labelElement.textContent = option;

                    // Add hover effect and cursor pointer
                    labelElement.style.cursor = "pointer";
                    labelElement.style.transition = "color 0.3s ease";
                    labelElement.style.marginRight = "10px"; // Add spacing to the right

                    // Add border and border-radius to the label
                    labelElement.style.border = "2px solid white";
                    labelElement.style.borderRadius = "4px";
                    labelElement.style.padding = "4px"; // Add padding to labels

                    // Wrap the label in a div with click event listener
                    const wrapper = document.createElement("div");
                    wrapper.className = `custom-radio`;

                    // Create a radio input
                    const input = document.createElement("input");
                    input.setAttribute("type", "radio");
                    input.className = `form-check-input`; // Bootstrap class for input
                    input.setAttribute("id", `${questionData.id}-${option}`);
                    input.setAttribute("name", questionData.id);
                    input.setAttribute("value", option);
                    input.style.display = "none"; // Hide the input

                    // Add a click event listener to the label
                    labelElement.addEventListener("click", () => {
                        // Clear previous selections
                        document.querySelectorAll(`input[name="${questionData.id}"]`).forEach((radio) => {
                            radio.checked = false;
                            radio.nextElementSibling.style.border = "2px solid white"; // Reset border color
                        });

                        input.checked = true; // Set the selected radio button
                        labelElement.style.border = "2px solid #ffd700"; // Change border color on selection
                    });

                    // Hover effect for label
                    labelElement.addEventListener("mouseenter", () => {
                        if (!input.checked) {
                            labelElement.style.border = "2px solid #ffd700"; // Change border color on hover
                        }
                        labelElement.style.color = "#ffd700"; // Change text color on hover
                    });

                    labelElement.addEventListener("mouseleave", () => {
                        if (!input.checked) {
                            labelElement.style.border = "2px solid white"; // Reset border color on mouse leave
                        }
                        labelElement.style.color = "white"; // Reset text color on mouse leave
                    });

                    // Append the input, label, and wrapper to the question element
                    wrapper.appendChild(input);
                    wrapper.appendChild(labelElement);
                    questionElement.appendChild(wrapper);
                });
                break;
            case "multipleChoice":
                questionData.options.forEach((option) => {
                    const labelElement = document.createElement("label");
                    labelElement.className = "form-check-label text-light"; // Bootstrap class for label
                    labelElement.setAttribute("for", `${questionData.id}-${option}`);
                    labelElement.textContent = option;

                    // Add hover effect and cursor pointer
                    labelElement.style.cursor = "pointer";
                    labelElement.style.transition = "color 0.3s ease";
                    labelElement.style.marginRight = "10px"; // Add spacing to the right

                    // Add border and border-radius to the label
                    labelElement.style.border = "2px solid white";
                    labelElement.style.borderRadius = "4px";
                    labelElement.style.padding = "4px"; // Add padding to labels

                    // Wrap the label in a div with click event listener
                    const wrapper = document.createElement("div");
                    wrapper.className = `custom-checkbox`;

                    // Create a checkbox input
                    const input = document.createElement("input");
                    input.setAttribute("type", "checkbox");
                    input.className = `form-check-input`; // Bootstrap class for input
                    input.setAttribute("id", `${questionData.id}-${option}`);
                    input.setAttribute("name", questionData.id);
                    input.setAttribute("value", option);
                    input.style.display = "none"; // Hide the input

                    // Add a click event listener to the label's wrapper
                    wrapper.addEventListener("click", () => {
                        input.checked = !input.checked; // Toggle the input's checked state

                        if (input.checked) {
                            labelElement.style.border = "2px solid gold"; // Change border color to gold when selected
                        } else {
                            labelElement.style.border = "2px solid white"; // Reset border color on deselection
                        }
                    });

                    // Hover effect for label
                    labelElement.addEventListener("mouseenter", () => {
                        if (!input.checked) {
                            labelElement.style.border = "2px solid #ffd700"; // Change border color on hover
                        }
                        labelElement.style.color = "#ffd700"; // Change text color on hover
                    });

                    labelElement.addEventListener("mouseleave", () => {
                        if (!input.checked) {
                            labelElement.style.border = "2px solid white"; // Reset border color on mouse leave
                        }
                        labelElement.style.color = "white"; // Reset text color on mouse leave
                    });

                    // Append the input, label, and wrapper to the question element
                    wrapper.appendChild(input);
                    wrapper.appendChild(labelElement);
                    questionElement.appendChild(wrapper);
                });
                break;
        }
        questionsContainer.appendChild(questionElement);
    });
}

function checkAnswers() {
    const resultMessage = document.getElementById("resultMessage");
    const userAnswers = {};

    questions.forEach((questionData) => {
        if (questionData.type === "text" || questionData.type === "dropdown") {
            const inputElement = document.getElementById(questionData.id);
            userAnswers[questionData.id] = inputElement.value;
        } else if (questionData.type === "singleChoice") {
            const selectedRadio = document.querySelector(`input[name="${questionData.id}"]:checked`);
            userAnswers[questionData.id] = selectedRadio ? selectedRadio.value : "";
        } else if (questionData.type === "multipleChoice") {
            const checkedBoxes = document.querySelectorAll(`input[name="${questionData.id}"]:checked`);
            userAnswers[questionData.id] = Array.from(checkedBoxes).map(el => el.value);
        }
    });

    let allCorrect = true;

    questions.forEach((questionData) => {
        const userAnswer = userAnswers[questionData.id];
        if (questionData.type === "multipleChoice") {
            allCorrect = allCorrect && arraysEqual(questionData.answers, userAnswer);
        } else {
            if (userAnswer !== questionData.answer) {
                allCorrect = false;
            }
        }
    });

    if (allCorrect) {
        resultMessage.innerText = "Congratulations, all answers are correct! You can move on to the next module.";
        resultMessage.classList.remove("incorrect"); // Remove the incorrect class
        resultMessage.classList.add("correct"); // Add the correct class

        if (!returnButtonCreated) {
            // Create a new button for going back to the main page if it hasn't been created
            var returnButton = document.createElement("button");
            returnButton.textContent = "Return to Main Page";
            returnButton.className = "returnButton"; // Assign a class for styling
            returnButton.onclick = function() {
                window.location.href = '/index.html'; // Change to your main page URL
            };
            // Append the button after the result message
            resultMessage.parentNode.insertBefore(returnButton, resultMessage.nextSibling);

            // Update the flag to indicate that the button has been created
            returnButtonCreated = true;
        }
        launchConfetti(); // Launch confetti
    } else {
        resultMessage.innerText = "Some answers are incorrect. Please review your answers and try again.";
        resultMessage.classList.remove("correct"); // Remove the correct class
        resultMessage.classList.add("incorrect"); // Add the incorrect class
    }
    resultMessage.style.display = "block";
}

// Function to check if two arrays have the same elements (disregarding order)
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    const sortedArr1 = arr1.sort();
    const sortedArr2 = arr2.sort();
    return sortedArr1.every((element, index) => element === sortedArr2[index]);
}


// Confetti settings and function
var duration = 15 * 1000;
var animationEnd = Date.now() + duration;
var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

function launchConfetti() {
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}

// Call the generateQuestions function to create question elements
generateQuestions();  