function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
}
window.onload = function () {
    google.accounts.id.initialize({
    client_id: "398792302857-gj4s9331t22kljn6inunra5tblqlmmpe.apps.googleusercontent.com",
    callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
    document.getElementById("googleButton"),
    { theme: "filled_black", size: "large", text: "continue_with", click_listener: onGoogleSignInButtonClick }  // customization attributes https://developers.google.com/identity/gsi/web/reference/html-reference#element_with_class_g_id_signin
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
}

function onGoogleSignInButtonClick (){
    console.log()
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);}).join(''));
    return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    console.log('Full Name: ' + responsePayload.name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);
}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  }

function onFailure(error) {
console.log(error);
}
