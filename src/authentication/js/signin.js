document.addEventListener('DOMContentLoaded', function() {
    var signInForm = document.querySelector('form');

    signInForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        var formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            if (data.authenticated) {
                localStorage.setItem('sessionId', data.sessionId);
                window.location.href = '/src/index.html'; // Redirect to home page on successful login
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            // console.error('Error logging in:', error);
            alert('Login error, please try again.');
        });
    });
});
