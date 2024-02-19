document.addEventListener('DOMContentLoaded', function () {
    // Simulated array of 70 items from the backend

    const encodedCurrentUser = document.getElementById('content').getAttribute('current-user');
    //console.log(encodedCurrentUser);
    const encodedStanovi = document.getElementById('content').getAttribute('data-stanovi');

    let currentUser;
    try {
        currentUser = JSON.parse(encodedCurrentUser);
    } catch (error) {
        currentUser = 1;
    }
    
    const stanovi = JSON.parse(encodedStanovi);
    //console.log(currentUser);
    // Number of items to load initially and per batch
    const itemsPerBatch = 12;
    let totalDisplayedItems = 0;

    // Function to check if the user has scrolled to the bottom
    function isScrolledToBottom() {
        return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
    }

    // Function to load more content
    function loadMoreContent() {
        // Display loading indicator
        document.getElementById('loading').style.display = 'block';

        // Simulate an AJAX request to fetch more content
       // setTimeout(function () {
            // Append new content to the container
            const contentContainer = document.getElementById('content');
            let brojac = 0;
            for (let i = totalDisplayedItems; i < totalDisplayedItems + itemsPerBatch && i < stanovi.length; i++) {
                //const newItem = document.createElement('div');
                //console.log(stanovi[i]);
                const cardElement = createCard(stanovi[i], currentUser);
                //newItem.className = 'item';
                //newItem.innerText = backendItems[i];
                contentContainer.appendChild(cardElement);
                brojac += 1;
            }

            // Update the total displayed items
            totalDisplayedItems += brojac;

            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
        //}, 1000); // Simulated delay for demonstration purposes
    }

    // Initial load of items
    loadMoreContent();

    // Event listener for scroll events
    window.addEventListener('scroll', function () {
        // Check if the user has scrolled to the bottom
        if (isScrolledToBottom() && totalDisplayedItems < stanovi.length) {
            // Load more content
            loadMoreContent();
        }
    });
});

// Example usage:
//const stanData = /* Replace with your actual data from the backend */;

//const cardElement = createCard(stanData);

// Append the card element to your container in the DOM

//document.getElementById('content').appendChild(cardElement);

function createCard(stan, currentUser) {
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card shadow-sm';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    if (stan.images.length) {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = stan.images[0].url;
        img.className = 'card-img-top';
        img.alt = '...';
        img.setAttribute('height', '400px');
        card.appendChild(img);
    } else {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = '/img/MojDizajn.png';
        img.className = 'card-img-top';
        img.alt = '...';
        img.setAttribute('height', '400px');
        card.appendChild(img);
    }

    const rect = document.createElement('rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', '#55595c');
    card.appendChild(rect);

    const title = document.createElement('h5');
    title.className = 'fs-4 ivanFont';
    title.textContent = stan.title;
    cardBody.appendChild(title);

    if (stan.description.length < 200) {
        const description = document.createElement('p');
        description.className = 'card-text ivanFont';
        description.textContent = stan.description;
        cardBody.appendChild(description);
    } else {
        const description = document.createElement('p');
        description.className = 'card-text ivanFont';

        for (let i = 0; i < 200; i++) {
            description.textContent += stan.description[i];
        }

        description.textContent += ' ...';
        cardBody.appendChild(description);
    }

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const viewBtn = document.createElement('a');
    viewBtn.className = 'btn btn-sm btn-outline-secondary';
    viewBtn.href = `/stanovi/${stan._id}`;
    viewBtn.textContent = 'Pogledajte';
    btnGroup.appendChild(viewBtn);

    if (currentUser && (stan.author == currentUser._id)) {
        const editBtn = document.createElement('a');
        editBtn.className = 'btn btn-sm btn-info';
        editBtn.href = `/stanovi/${stan._id}/edit`;
        editBtn.textContent = 'Preuredi';
        btnGroup.appendChild(editBtn);

        const deleteForm = document.createElement('form');
        deleteForm.className = 'd-inline';
        deleteForm.action = `/stanovi/${stan._id}?_method=DELETE`;
        deleteForm.method = 'POST';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Izbrisi';
        deleteForm.appendChild(deleteBtn);

        btnGroup.appendChild(deleteForm);
    }

    const cardFooter = document.createElement('div');
    cardFooter.className = 'd-flex justify-content-between align-items-center';

    cardFooter.appendChild(btnGroup);

    cardBody.appendChild(cardFooter);

    card.appendChild(cardBody);

    col.appendChild(card);

    return col;
}


