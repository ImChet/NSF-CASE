document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.querySelector('form');
    const toast = document.querySelector('.toast');
    const closeIcon = document.querySelector('.close');
    const passwordInput = document.getElementById('password');
    const registerButton = document.getElementById('registerButton');
    const progress = document.querySelector('.progress');

    let timer1, timer2;

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

    // Add an event listener to submit the form
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
                    // Username is already taken, show the toast
                    toast.classList.add('active');
                    progress.classList.add('active');

                    timer1 = setTimeout(() => {
                        toast.classList.remove('active');
                    }, 5000); // 5 seconds

                    timer2 = setTimeout(() => {
                        progress.classList.remove('active');
                    }, 5300);

                    // Handle other responses here if needed

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
                if (error.message !== 'Username already exists') {
                    // Handle other errors here
                }
            });
    });

    // Add an event listener to close the toast when the close icon is clicked
    closeIcon.addEventListener('click', () => {
        const toast = document.querySelector('.toast.active');
        if (toast) {
            toast.classList.remove('active');
        }

        setTimeout(() => {
            progress.classList.remove('active');
        }, 300);

        clearTimeout(timer1);
        clearTimeout(timer2);
    });
});
