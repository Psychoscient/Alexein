const authLogin = document.getElementById('signup');
const authSignup = document.getElementById('login');

let books = load("books", [
    {title:"Harry Potter", author:"J.K. Rowling", genre:"Fantasy", copies:5},
    {title:"The Hobbit", author:"J.R.R. Tolkien", genre:"Fantasy", copies:3}
]);

let users = load("users", [
    {username:"Librarian", password:"CICS", type:"librarian"}
]);

let borrowRecords = load("borrowRecords", []);
let loggedUser = null;


// Show signup form and hide login form

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