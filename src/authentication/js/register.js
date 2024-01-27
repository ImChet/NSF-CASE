document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.querySelector('form');

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (response.status === 409) {
                    // Handle conflict (username already exists)
                    throw new Error('Username already exists');
                }
                if (!response.ok) {
                    // If the response status is not OK for other reasons, throw an error
                    throw new Error('Registration failed with status: ' + response.status);
                }
                return response.json(); // Parse the JSON response body
            })
            .then(data => {
                // Check if the registration was successful based on the server's response
                if (data.success) {
                    // If successful, redirect the user to the sign-in page
                    window.location.href = '/src/authentication/signin.html';
                }
            })
            .catch(error => {
                if (error.message === 'Username already exists') {
                    // Display a user-friendly message for username conflict
                    alert('Username is already taken. Please choose another username.');
                } else {
                    alert('Registration failed, please try again.');
                }
            });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.querySelector('form');
    const passwordInput = document.getElementById('password'); // Get the password input element
    const registerButton = document.getElementById('registerButton'); // Get the button element

    // Function to check password complexity
    function isPasswordComplex(password) {
        // Complexity requirements logic
        // Example: Password must be at least 8 characters long and contain at least one letter and one digit.
        const minLength = 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);

        return password.length >= minLength && hasLetter && hasDigit;
    }

    // Function to enable the button and remove disabled style
    function enableButton() {
        registerButton.removeAttribute('disabled');
        registerButton.classList.remove('button-disabled');
    }

    // Function to disable the button and apply disabled style
    function disableButton() {
        registerButton.setAttribute('disabled', 'true');
        registerButton.classList.add('button-disabled');
    }

    // Add an event listener to the password input for checking complexity
    passwordInput.addEventListener('input', function () {
        const password = this.value;

        // Check password complexity and enable/disable the button accordingly
        if (isPasswordComplex(password)) {
            // Password meets complexity requirements
            enableButton();
        } else {
            // Password does not meet complexity requirements
            disableButton();
        }
    });

    // Initial state: Disable the button
    disableButton();
});
