const booksPerPage = 10;
let currentPage = 1;
let myLibrary = JSON.parse(localStorage.getItem('myLibrary'))?.map(obj => Object.assign(new Book(), obj)) || [];


function generateId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

function Book(title, author, pages, read) {
  this.id = generateId();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function saveLibrary() {
  localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
}

function addBookToLibrary(title, author, pages, read) {
  const newBook = new Book(title, author, pages, read);
  myLibrary.push(newBook);
  saveLibrary();
  currentPage = Math.ceil(myLibrary.length / booksPerPage);
  renderLibrary();
}

function removeBookById(id) {
  const index = myLibrary.findIndex(book => book.id === id);
  if (index > -1) {
    myLibrary.splice(index, 1);
    saveLibrary();
    if ((currentPage - 1) * booksPerPage >= myLibrary.length && currentPage > 1) {
      currentPage--;
    }
    renderLibrary();
  }
}

function toggleBookReadStatus(id) {
  const book = myLibrary.find(b => b.id === id);
  if (book) {
    book.toggleRead();
    saveLibrary();
    renderLibrary();
  }
}

function renderLibrary() {
  const booksContainer = document.querySelector('.books');
  booksContainer.innerHTML = '';

  const totalPages = Math.ceil(myLibrary.length / booksPerPage) || 1;
  const start = (currentPage - 1) * booksPerPage;
  const pageBooks = myLibrary.slice(start, start + booksPerPage);

  const bookGrid = document.createElement('div');
  bookGrid.classList.add('book-grid');

  pageBooks.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('book-card');

    card.innerHTML = `
        <div class="book-row">
            <span class="book-main">
            ${book.title} by ${book.author}, <span class="book-pages">${book.pages} pages</span>
            </span>
            <span class="book-status">
            Status: <span class="${book.read ? 'read' : 'unread'}">${book.read ? 'Read' : 'Not Read'}</span>
            <button class="delete-button" data-id="${book.id}" title="Delete">
                <img src="./images/delete.png" alt="Delete" />
            </button>
            </span>
        </div>
    `;

    card.querySelector('.delete-button').addEventListener('click', () => {
        removeBookById(book.id);
        renderLibrary();
    });

    card.addEventListener('click', () => toggleBookReadStatus(book.id));

    bookGrid.appendChild(card);
  });

  booksContainer.appendChild(bookGrid);
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  let pagination = document.querySelector('.pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.classList.add('pagination');
    document.querySelector('.books').appendChild(pagination);
  }

  pagination.innerHTML = `
    <button id="prevBtn" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button id="nextBtn" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
  `;

  document.getElementById('prevBtn')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderLibrary();
    }
  });

  document.getElementById('nextBtn')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderLibrary();
    }
  });
}

// FORMS & DIALOG
const dialog = document.getElementById('bookDialog');
const form = document.getElementById('bookForm');
const newBookBtn = document.getElementById('newBookBtn');
const cancelBtn = document.getElementById('cancelBtn');

newBookBtn.addEventListener('click', () => {
  dialog.showModal();
});
cancelBtn.addEventListener('click', () => {
  dialog.close();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const pages = parseInt(document.getElementById('bookPages').value);
  const read = document.getElementById('bookRead').checked;

  if (title && author && pages) {
    addBookToLibrary(title, author, pages, read);
    form.reset();
    dialog.close();
  }
});

renderLibrary();
