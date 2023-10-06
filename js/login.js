document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Get the entered username and password
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Check if the entered credentials are correct
        if (email === "admin@gmail.com" && password === "admin123") {
            // Redirect to index.html on successful login
            window.location.href = "index.html";
            alert("Login Successfully");
        } else {
            alert("Invalid credentials. Please try again.");
        }
    });
});
