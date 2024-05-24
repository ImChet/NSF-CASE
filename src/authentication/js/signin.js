document.addEventListener('DOMContentLoaded', function() {
    var signInForm = document.querySelector('form');
    const toast = document.querySelector('.toast');
    const progress = document.querySelector('.progress');
    const closeIcon = document.querySelector('.close');

    var timer1, timer2;

    // Function to hide the toast
    function hideToast() {
        toast.classList.remove('active');
        progress.classList.remove('active');
    }

    // Hide the toast initially
    hideToast();

    signInForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        var formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        
        fetch('/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if ((!response.ok) && (response.status != 401)) { // Returned a status code outside of 200-299 and isn't authorization error (401)
                // Display the warning toast on login failure
                toast.classList.add('active');
                progress.classList.add('active');

                timer1 = setTimeout(() => {
                    hideToast();
                }, 5000); // 5 seconds

                timer2 = setTimeout(() => {
                    progress.classList.remove('active');
                }, 5300);

                //throw new Error(`Network response: ${response.status}`);
                throw new Error(`Code: ${response.status}\n${response.message}`)
            }
            return response.json();
        })
        .then(data => {
            if (data.authenticated) {
                localStorage.setItem('sessionId', data.sessionId);
                window.location.href = '/src/home/html/index.html'; // Redirect to home page on successful login
            } else { // *Should* be error code 401 only gets here and is authenticated == false
                // Replace the default message in the toast
                toast.classList.add('active');
                progress.classList.add('active');
                toast.querySelector('.text-2').textContent = 'Authentication failed. Please try again.';

                timer1 = setTimeout(() => {
                    hideToast();
                }, 5000); // 5 seconds

                timer2 = setTimeout(() => {
                    progress.classList.remove('active');
                }, 5300);
            }
        })
        .catch(error => {
            // Replace the default message in the toast
            toast.classList.add('active');
            progress.classList.add('active');
            toast.querySelector('.text-2').textContent = 'Login error. ' + error;

            timer1 = setTimeout(() => {
                hideToast();
            }, 5000); // 5 seconds

            timer2 = setTimeout(() => {
                progress.classList.remove('active');
            }, 5300);
        });
    });

    // Add an event listener to close the toast when the close icon is clicked by user
    closeIcon.addEventListener('click', () => {
        hideToast();
        clearTimeout(timer1);
        clearTimeout(timer2);
    });
});
