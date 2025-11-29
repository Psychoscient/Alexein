/* ————————————————
   STORAGE HELPERS
——————————————— */
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
    return JSON.parse(localStorage.getItem(key)) || fallback;
}

// Clear Local Storage (for testing purposes)
// localStorage.clear();

/* ————————————————
   DATA (LOAD FROM LOCAL STORAGE)
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

// Borrowed books structure:
// { title, img, author, genre, borrowedCopies }
let borrowRecords = load("borrowRecords", []);

/* ————————————————
   DOM ELEMENTS
——————————————— */
const bookList = document.querySelector(".book-list");
const borrowedList = document.querySelector(".borrowed-list");

/* ————————————————
   DISPLAY ALL BOOKS
——————————————— */
function renderBooks() {
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
   BORROW A BOOK
——————————————— */
function borrowBook(title) {
    let book = books.find(b => b.title === title);
    if (!book || book.copies < 1) {
        alert("No copies left.");
        return;
    }

    // Deduct 1 copy from main inventory
    book.copies--;
    save("books", books);

    // Check if already borrowed
    let record = borrowRecords.find(r => r.title === title);

    if (record) {
        // Increase borrowed count
        record.borrowedCopies++;
    } else {
        // New borrowed card
        borrowRecords.push({
            title: book.title,
            img: book.img,
            author: book.author,
            genre: book.genre,
            borrowedCopies: 1
        });
    }

    save("borrowRecords", borrowRecords);

    renderBooks();
    renderBorrowed();
}

/* ————————————————
   RETURN A BOOK
——————————————— */
function returnBook(title) {
    let record = borrowRecords.find(r => r.title === title);
    if (!record) return;

    // Decrease borrowed quantity
    record.borrowedCopies--;

    // Return one copy back to inventory
    let book = books.find(b => b.title === title);
    if (book) book.copies++;

    // Remove borrowed card if fully returned
    if (record.borrowedCopies <= 0) {
        borrowRecords = borrowRecords.filter(r => r.title !== title);
    }

    save("borrowRecords", borrowRecords);
    save("books", books);

    renderBooks();
    renderBorrowed();
}

/* ————————————————
   DISPLAY BORROWED BOOKS
——————————————— */
function renderBorrowed() {
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
   INIT
——————————————— */
document.addEventListener("DOMContentLoaded", () => {
    renderBooks();
    renderBorrowed();
});
