const apiEndpoint = 'https://gutendex.com/books.json';
let currentPage = 1;
const booksPerPage = 5; // Number of books to display per page
let totalBooks = 0; // Total number of books fetched
let isFirstLoad = true; // Flag to track if it's the first load
// Function to fetch books from the API
function fetchBooks(page, searchQuery = '') {
    const queryParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
    const loadingMessage = document.getElementById('loading-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Show loading message only during the first load
    if (isFirstLoad) {
        loadingMessage.style.display = 'block'; // Show the loading message
        loadingIndicator.style.display = 'none';
    } else if (searchQuery) {
        // If there is a search query, show only the loading indicator
        loadingIndicator.style.display = 'block';
        loadingMessage.style.display = 'none'; // Hide loading message for searches
    }

    fetch(`${apiEndpoint}?page=${page}&limit=${booksPerPage}${queryParam}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading message after the first load
            if (isFirstLoad) {
                loadingMessage.style.display = 'none'; // Hide the loading message
                isFirstLoad = false; // Set the flag to false after the first load
            }

            totalBooks = data.results.length; // Update total books
            displayBooks(data.results, searchQuery); // Pass the search query to displayBooks
            setupPagination();
        })
        .catch(error => {
            loadingMessage.style.display = 'none'; // Hide the loading message on error
            loadingIndicator.style.display = 'none'; // Hide loading indicator on error
            console.error('Error fetching books:', error);
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Hide loading indicator
        });
}
// Function to display books in the UI
function displayBooks(books, searchQuery) {
    const bookContainer = document.getElementById('book-list');
    bookContainer.innerHTML = ''; // Clear previous books

    // Normalize the search query to lowercase
    const normalizedSearchQuery = searchQuery.toLowerCase();

    books.forEach(book => {
        // Normalize the book title to lowercase for case-insensitive comparison
        const bookTitleNormalized = book.title.toLowerCase();
        if (normalizedSearchQuery === '' || bookTitleNormalized.includes(normalizedSearchQuery)) {
            const bookItem = `
                <div class="col-md-3 mb-4">
                    <div class="card m-auto h-100">
                        <img src="${book.formats['image/jpeg'] || 'placeholder.jpg'}" class="card-img-top h-50" alt="${book.title}">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text">${book.authors.map(author => author.name).join(', ')}</p>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary add-to-wishlist w-100" data-id="${book.id}">Add to Wishlist</button>
                        </div>
                    </div>
                </div>`;
            bookContainer.innerHTML += bookItem;
        }
    });

    addWishlistEventListeners(); // Add event listeners to wishlist buttons
}

function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear previous pagination
    const totalPages = Math.ceil(totalBooks / booksPerPage);

    // Previous button
    const prevButton = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''} w-25">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>`;
    paginationContainer.innerHTML += prevButton;

    // Page numbers (1, 2, 3, ...)
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = `
            <li class="page-item ${currentPage === i ? 'active' : ''} w-25">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        paginationContainer.innerHTML += pageItem;
    }

    // Next button
    const nextButton = `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''} w-25">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>`;
    paginationContainer.innerHTML += nextButton;

    // Add event listeners to pagination links
    const pageLinks = paginationContainer.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const page = Number(link.getAttribute('data-page'));

            // Check if the page is valid before fetching
            if (page >= 1 && page <= totalPages) {
                currentPage = page; // Set the current page
                fetchBooks(currentPage, document.getElementById('search-input').value); // Fetch books for the selected page
            }
        });
    });
}

// Function to add event listeners to wishlist buttons
function addWishlistEventListeners() {
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', addToWishlist);
    });
}

// Function to add a book to the wishlist
function addToWishlist(event) {
    const bookId = event.target.getAttribute('data-id');
    const bookElement = event.target.closest('.col-md-3');
    const bookTitle = bookElement.querySelector('.card-title').innerText;
    const bookAuthors = bookElement.querySelector('.card-text').innerText;
    const bookImage = bookElement.querySelector('img').src;

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const bookExists = wishlist.find(book => book.id === bookId);

    if (bookExists) {
        alert('This book is already in your wishlist!');
        return;
    }

    const newBook = { id: bookId, title: bookTitle, authors: bookAuthors, image: bookImage };
    wishlist.push(newBook);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    alert('Book added to wishlist!');
}

// Initial fetch of books
fetchBooks(currentPage);

// Real-time search implementation
document.getElementById('search-input').addEventListener('input', function() {
    const searchQuery = this.value;
    currentPage = 1; // Reset to the first page
    fetchBooks(currentPage, searchQuery); // Fetch books with the search query
});
