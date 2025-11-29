/* ————————————————
   STORAGE HELPERS
——————————————— */
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
    return JSON.parse(localStorage.getItem(key)) || fallback;
}

// localStorage.clear(); // TEMP — uncomment for testing only

/* ————————————————
   LOAD USERS & BOOKS
——————————————— */
let books = load("books", [
    { 
        title: "The Subtle Art of Not Giving a F*ck", 
        author: "Mark Manson", 
        genre: "Self-Help", 
        copies: 5, 
        img: "./assets/books/1.jpg" 
    },
    { 
        title: "The 48 Laws of Power", 
        author: "Robert Greene", 
        genre: "Self-Help", 
        copies: 5, 
        img: "./assets/books/2.png" 
    },
    { 
        title: "The Fault in Our Stars", 
        author: "John Green", 
        genre: "Romance", 
        copies: 5, 
        img: "./assets/books/3.jpg" 
    },
    { 
        title: "Atomic Habits", 
        author: "James Clear", 
        genre: "Self-Help", 
        copies: 5, 
        img: "./assets/books/4.png" 
    },
    { 
        title: "The Alchemist", 
        author: "Paulo Coelho", 
        genre: "Fantasy", 
        copies: 5, 
        img: "./assets/books/5.jpg" 
    }
]);

let users = load("users", [
    { username: "Librarian", password: "CICS", type: "librarian" }
]);

let loggedUser = load("loggedUser", null);

/* ————————————————
   USER-SPECIFIC BORROW RECORDS
——————————————— */
function getBorrowKey() {
    return loggedUser ? `borrowRecords_${loggedUser.username}` : "borrowRecords_guest";
}

let borrowRecords = load(getBorrowKey(), []);

/* ————————————————
   DOM ELEMENTS
——————————————— */
const bookList = document.querySelector(".book-list");
const borrowedList = document.querySelector(".borrowed-list");

const login = document.getElementById("login");
const signup = document.getElementById("signup");

/* ————————————————
   AUTHENTICATION LOGIC
——————————————— */
function showSignup() {
    login.classList.add("hidden");
    signup.classList.remove("hidden");
}

function showLogin() {
    signup.classList.add("hidden");
    login.classList.remove("hidden");
}

function signupUser() {
    let username = document.getElementById("signupUsername").value.trim();
    let password = document.getElementById("signupPassword").value.trim();

    if (!username || !password) {
        alert("Please fill out all fields.");
        return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Username already taken!");
        return;
    }

    users.push({ username, password, type: "user" });
    save("users", users);

    alert("Account created! You may now log in.");
    showLogin();
}

function loginUser() {
    let username = document.getElementById("loginUsername").value.trim();
    let password = document.getElementById("loginPassword").value.trim();

    let user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Incorrect username or password!");
        return;
    }

    save("loggedUser", user);
    loggedUser = user;
    borrowRecords = load(getBorrowKey(), []);

    if (user.type === "librarian") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "auth.html";
}

/* ————————————————
   RENDER BOOKS
——————————————— */
function renderBooks() {
    if (!bookList) return;

    bookList.innerHTML = "";

    books.forEach(book => {
        const item = document.createElement("div");
        item.classList.add("book-item");

        item.innerHTML = `
            <img src="${book.img}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <p>${book.genre}</p>
            <p class="copies">Copies Available: <span>${book.copies}</span></p>
            <button class="borrow-btn" onclick="borrowBook('${book.title}')">Borrow</button>
        `;

        bookList.appendChild(item);
    });
}

/* ————————————————
   SEARCH BOOKS
——————————————— */

function searchBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query)
    );

    renderFilteredBooks(filteredBooks);
}

function renderFilteredBooks(filtered) {
    if (!bookList) return;

    bookList.innerHTML = "";

    if (filtered.length === 0) {
        bookList.innerHTML = `<p>No books found.</p>`;
        return;
    }

    filtered.forEach(book => {
        const item = document.createElement("div");
        item.classList.add("book-item");

        item.innerHTML = `
            <img src="${book.img}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <p>${book.genre}</p>
            <p class="copies">Copies Available: <span>${book.copies}</span></p>
            <button class="borrow-btn" onclick="borrowBook('${book.title}')">Borrow</button>
        `;

        bookList.appendChild(item);
    });
}


/* ————————————————
   BORROW BOOK (PER USER)
——————————————— */
function borrowBook(title) {
    let book = books.find(b => b.title === title);
    if (!book || book.copies < 1) {
        alert("No copies left.");
        return;
    }

    book.copies--;
    save("books", books);

    let record = borrowRecords.find(r => r.title === title);

    if (record) {
        record.borrowedCopies++;
    } else {
        borrowRecords.push({
            title: book.title,
            img: book.img,
            author: book.author,
            genre: book.genre,
            borrowedCopies: 1
        });
    }

    save(getBorrowKey(), borrowRecords);

    renderBooks();
    renderBorrowed();
}

/* ————————————————
   RETURN BOOK
——————————————— */
function returnBook(title) {
    let record = borrowRecords.find(r => r.title === title);
    if (!record) return;

    record.borrowedCopies--;

    let book = books.find(b => b.title === title);
    if (book) book.copies++;

    if (record.borrowedCopies <= 0) {
        borrowRecords = borrowRecords.filter(r => r.title !== title);
    }

    save("books", books);
    save(getBorrowKey(), borrowRecords);

    renderBooks();
    renderBorrowed();
}

/* ————————————————
   RENDER BORROWED (FOR THIS USER ONLY)
——————————————— */
function renderBorrowed() {
    if (!borrowedList) return;

    borrowRecords = load(getBorrowKey(), []);

    borrowedList.innerHTML = "";

    if (borrowRecords.length === 0) {
        borrowedList.innerHTML = `<p>No borrowed books yet.</p>`;
        return;
    }

    borrowRecords.forEach(rec => {
        const item = document.createElement("div");
        item.classList.add("book-item");

        item.innerHTML = `
            <img src="${rec.img}">
            <h3>${rec.title}</h3>
            <p>${rec.author}</p>
            <p>${rec.genre}</p>
            <p class="copies">Borrowed Copies: <span>${rec.borrowedCopies}</span></p>
            <button class="borrow-btn" onclick="returnBook('${rec.title}')">Return</button>
        `;

        borrowedList.appendChild(item);
    });
}

/* ————————————————
   PAGE PROTECTION + INIT
——————————————— */
document.addEventListener("DOMContentLoaded", () => {
    let current = window.location.pathname.split("/").pop();
    let protectedPages = ["index.html", "library.html", "about.html", "admin.html"];

    if (protectedPages.includes(current) && !loggedUser) {
        window.location.href = "auth.html";
        return;
    }

    renderBooks();
    renderBorrowed();
});
