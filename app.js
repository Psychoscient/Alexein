// Keeping these as originally defined, assuming they exist on your login/signup page.
// The Librarian.html page does not have elements with IDs 'signup' or 'login'.
const authLogin = document.getElementById('signup'); 
const authSignup = document.getElementById('login');

// --- Data Persistence Functions ---

function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function load(key, defaultData) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
}

// --- Initial Data Load ---

let books = load("books", [
    {title:"Harry Potter", author:"J.K. Rowling", genre:"Fantasy", copies:5, totalCopies: 5},
    {title:"The Hobbit", author:"J.R.R. Tolkien", genre:"Fantasy", copies:3, totalCopies: 3}
]);

let users = load("users", [
    {username:"Librarian", password:"CICS", type:"librarian"}
]);

let borrowRecords = load("borrowRecords", []);

// Check for a logged-in user on load
let loggedUser = load("loggedUser", null); 


// --- Authentication Functions (Assuming required IDs exist on a different page) ---

function showSignup(){ 
    if(authLogin) authLogin.classList.add("hidden");
    if(authSignup) authSignup.classList.remove("hidden");
}

function showLogin(){ 
    if(authSignup) authSignup.classList.add("hidden");
    if(authLogin) authLogin.classList.remove("hidden");
}

function login() {
    // *** NOTE: These IDs must exist on your login form page (e.g., index.html) ***
    const username = document.getElementById('loginUsername')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const messageDiv = document.getElementById('loginMessage');

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        loggedUser = user;
        save("loggedUser", loggedUser);
        if (messageDiv) {
            messageDiv.textContent = `Success! Logging in as ${user.username}...`;
            messageDiv.className = 'mt-2 text-success';
        }
        
        // Redirect based on user type
        setTimeout(() => {
            if (user.type === 'librarian') {
                window.location.href = 'Librarian.html';
            } else {
                // Assuming Home page is 'index.html'
                window.location.href = 'index.html'; 
            }
        }, 1000);

    } else {
        if (messageDiv) {
            messageDiv.textContent = 'Invalid username or password.';
            messageDiv.className = 'mt-2 text-danger';
        }
    }
}

function signup() {
    // *** NOTE: These IDs must exist on your signup form page (e.g., index.html) ***
    const username = document.getElementById('signupUsername')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const messageDiv = document.getElementById('signupMessage');

    if (users.some(u => u.username === username)) {
        if(messageDiv) {
            messageDiv.textContent = 'Username already taken.';
            messageDiv.className = 'mt-2 text-danger';
        }
        return;
    }

    if (!username || username.length < 3 || !password || password.length < 3) {
        if(messageDiv) {
            messageDiv.textContent = 'Username and password must be at least 3 characters.';
            messageDiv.className = 'mt-2 text-danger';
        }
        return;
    }

    const newUser = {username: username, password: password, type: "student"};
    users.push(newUser);
    save("users", users);

    if(messageDiv) {
        messageDiv.textContent = 'Registration successful! Please log in.';
        messageDiv.className = 'mt-2 text-success';
    }
    
    // Auto switch to login form (assuming showLogin function is linked to a button)
    setTimeout(() => {
        showLogin();
    }, 1000);
}

function logout() {
    loggedUser = null;
    save("loggedUser", null);
    window.location.href = 'index.html'; // Redirect to home/login page
}

/**
 * Checks if the logged-in user is a librarian and redirects if not.
 * Called by Librarian.html on load.
 */
function checkLibrarianAccess() {
    if (!loggedUser || loggedUser.type !== 'librarian') {
        alert("Access Denied: You must be logged in as a Librarian.");
        window.location.href = 'index.html';
    }
}


// --- Librarian Dashboard Functions ---

function renderBooks() {
    // Uses existing ID: booksTableBody
    const tableBody = document.getElementById('booksTableBody');
    if (!tableBody) return; 

    tableBody.innerHTML = '';
    
    books.forEach((book, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = book.title;
        row.insertCell(1).textContent = book.author;
        row.insertCell(2).textContent = book.genre;
        row.insertCell(3).textContent = `${book.copies} / ${book.totalCopies}`;

        // Actions column
        const actionsCell = row.insertCell(4);
        
        // Edit Copies Button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-info me-2';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editCopies(index);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteBook(index);

        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

function addBook() {
    // Uses existing IDs: newBookTitle, newBookAuthor, newBookGenre, newBookCopies, addBookMessage
    const title = document.getElementById('newBookTitle').value.trim();
    const author = document.getElementById('newBookAuthor').value.trim();
    const genre = document.getElementById('newBookGenre').value.trim();
    const copies = parseInt(document.getElementById('newBookCopies').value);
    const messageDiv = document.getElementById('addBookMessage');

    if (!title || !author || !genre || isNaN(copies) || copies <= 0) {
        messageDiv.textContent = 'Please fill out all fields correctly.';
        messageDiv.className = 'mt-2 text-danger';
        return;
    }

    const newBook = { title, author, genre, copies, totalCopies: copies };
    books.push(newBook);
    save("books", books);

    // Clear form fields
    document.getElementById('newBookTitle').value = '';
    document.getElementById('newBookAuthor').value = '';
    document.getElementById('newBookGenre').value = '';
    document.getElementById('newBookCopies').value = '';

    renderBooks();
    messageDiv.textContent = `Book "${title}" added successfully!`;
    messageDiv.className = 'mt-2 text-success';
}

function editCopies(index) {
    const book = books[index];
    let newTotalCopies = prompt(`Enter new total copies for "${book.title}" (Current: ${book.totalCopies}):`);

    if (newTotalCopies === null) return; 

    newTotalCopies = parseInt(newTotalCopies);

    if (isNaN(newTotalCopies) || newTotalCopies < 0) {
        alert("Please enter a valid non-negative number.");
        return;
    }

    const copiesDifference = newTotalCopies - book.totalCopies;
    
    book.totalCopies = newTotalCopies;
    book.copies += copiesDifference; 
    
    if (book.copies < 0) {
        book.copies = 0; 
    }

    save("books", books);
    renderBooks();
}

function deleteBook(index) {
    if (confirm(`Are you sure you want to delete "${books[index].title}"? This cannot be undone.`)) {
        books.splice(index, 1);
        save("books", books);
        renderBooks();
    }
}

function renderUsers() {
    // Uses existing ID: usersTableBody
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return; 

    tableBody.innerHTML = '';

    // Only show non-librarian users for simplicity
    users.filter(u => u.type !== 'librarian').forEach(user => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = user.username;
        row.insertCell(1).textContent = user.type.charAt(0).toUpperCase() + user.type.slice(1);
    });
}

function renderBorrowRecords() {
    // This function will be empty as your HTML doesn't have a dedicated table for records yet.
    // If you add an element with ID 'borrowRecordsTableBody', you can complete this function.
}

// --- User/Borrower Functions (Placeholder for non-librarian pages) ---

function borrowBook(bookTitle) {
    if (!loggedUser) {
        alert("Please log in to borrow a book.");
        return;
    }
    // ... rest of the borrow logic ...
}

function returnBook(bookTitle) {
    // ... rest of the return logic ...
}


// --- Initialize Dashboard on Load ---

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");

    // Display welcome message (uses existing ID: welcomeLibrarian)
    if (document.getElementById('welcomeLibrarian') && loggedUser && loggedUser.type === 'librarian') {
        document.getElementById('welcomeLibrarian').textContent = 'Welcome, ' + loggedUser.username + '!';
    }

    // Call render functions for the dashboard
    renderBooks();
    renderUsers();
    renderBorrowRecords();
});