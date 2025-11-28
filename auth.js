const authLogin = document.getElementById('signup');
const authSignup = document.getElementById('login');

function showSignup(){ 
    authSignup.classList.add("hidden");
    authLogin.classList.remove("hidden");
}

function showLogin(){ 
    authSignup.classList.remove("hidden");
    authLogin.classList.add("hidden");
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
});