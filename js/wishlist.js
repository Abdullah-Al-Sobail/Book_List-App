// Function to display the wishlist
function displayWishlist() {
    const wishlistContainer = document.querySelector('.wishlist-container');
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Clear the wishlist container before adding new items
    wishlistContainer.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p class="text-center">Your wishlist is empty.</p>';
        return;
    }

    wishlist.forEach(book => {
        const bookCard = `
          <div class="col-md-3 mb-4">
              <div class="card p-2 h-100">
                  <div class="card-img-top">
                      <img src="${book.image || './assets/images/book-placeholder.jpg'}" class="img-fluid" alt="${book.title}">
                  </div>
                  <div class="card-body">
                      <h5 class="card-title text-center">${book.title}</h5>
                      <p class="card-text text-center"><em>${book.author}</em></p>
                      <button class="btn btn-danger remove-from-wishlist" data-id="${book.id}"><i class="bi bi-trash me-2"></i> Remove</button>
                  </div>
              </div>
          </div>`;
        wishlistContainer.innerHTML += bookCard;
    });

    // Add event listeners to "Remove" buttons
    addRemoveEventListeners();
}

// Function to remove a book from the wishlist
function removeFromWishlist(event) {
    const bookId = event.target.closest('.remove-from-wishlist').getAttribute('data-id');
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(book => book.id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist(); // Refresh the display
}

// Function to add event listeners to remove buttons
function addRemoveEventListeners() {
    const removeButtons = document.querySelectorAll('.remove-from-wishlist');
    removeButtons.forEach(button => {
        button.addEventListener('click', removeFromWishlist);
    });
}

// Display wishlist on page load
displayWishlist();
