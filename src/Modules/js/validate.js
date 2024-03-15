let allCorrect = false; // We assume they are wrong unless proven otherwise

/**
 * This helper function is needed for binding the user inputs on TEXT inputs.
 * @param {string} element 
 */
function updateValue(element) {
    document.getElementById(element.id).value = element.value;
}

/**
 * This helper functions extracts the user's responses by 
 * assuming that all questions are assigned the class prompt. 
 * Using this list, creates an object of the structure
 * {
        "Q1" :  ["answer here"],
        ...
        "Qn" : ["answer here", "answer here"]
    }
 * @returns {object} answer
 */
function extractResponse() {
    const numQuestions = document.getElementsByClassName("prompt").length; // We assume that all question labels are given the class "prompt"
    let answers = {}
    let questionRes = [];                                                   // Store all response per question in this var
    let ascii_letter = 97;                                                  // We assume all responses use the format Q[0..n][a...z]
    let query = "";                                                         // Use to store queries
    let queryRes = null;                                                    // We assume it is null unless proven otherwise

    // Outer loop retrieves all questions
    if (numQuestions !== null) {
        for (let i = 1; i <= numQuestions; i++) {
            query = "Q" + i + String.fromCharCode(ascii_letter);
            queryRes = document.getElementById(query);

            //Inner loop retrieve all responses and appends them to an array
            while (queryRes !== null) {
                // Debug
                if (queryRes !== null)
                    console.log("Query: " + query + ": " + queryRes.value);

                // Append to answer
                if (queryRes.checked || queryRes.type === "text" || queryRes.type === "select-one")
                    questionRes.push(queryRes.value);

                // Get next part
                ascii_letter++;
                query = "Q" + i + String.fromCharCode(ascii_letter);
                queryRes = document.getElementById(query);
            }
            answers["Q" + i] = questionRes;   // Store all answers for Qn

            // Reset for Qn+1
            questionRes = [];
            ascii_letter = 97;
        }
    }

    return answers;
}

/**
 * This calls extractResponse() and getAnswers() which return
 * the user's answers and the correct answers respectively.
 * It then displays a block indicating whether the answers were correct.
 * @param {HTMLButtonElement} element instance of the submit button.
 */
async function checkAnswers(element) {
    const userAnswers = extractResponse(); // extractResponse returns and object; we just want the values
    console.log(element.id);
    console.log(userAnswers);
    try {
        const requestOptions = {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: userAnswers

        };

        const res = await fetch(`http://localhost:3000/check/${element.id}`, requestOptions);
        console.log("res");
        console.log(res);

        if (allCorrect) {
            resultMessage.innerText = "Congratulations, all answers are correct! You can move on to the next module.";
            resultMessage.classList.remove("incorrect"); // Remove the incorrect class
            resultMessage.classList.add("correct"); // Add the correct class
            launchConfetti(); // Launch confetti
        } else {
            resultMessage.innerText = "Some answers are incorrect. Please review your answers and try again.";
            conso
            resultMessage.classList.remove("correct"); // Remove the correct class
            resultMessage.classList.add("incorrect"); // Add the incorrect class
        }
        resultMessage.style.display = "block";
    } catch (error) {
        console.log(error);
    }
}

// // Confetti settings and function
var duration = 15 * 1000;
var animationEnd = Date.now() + duration;
var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

// /**
//  * Help function to generate confetti on correct response.
//  */
function launchConfetti() {
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
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