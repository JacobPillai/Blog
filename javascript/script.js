document.addEventListener('DOMContentLoaded', function() {
    const allPosts = Array.from(document.querySelectorAll('.blog-grid .blog-post'));
    const paginationContainer = document.querySelector('.pagination');
    const postsPerPage = 6;

    function displayAndPaginate(posts) {
        const pageCount = Math.ceil(posts.length / postsPerPage);
        let currentPage = 1;

        function showPage(page) {
            allPosts.forEach(post => post.style.display = 'none');
            const start = (page - 1) * postsPerPage;
            const end = start + postsPerPage;
            posts.slice(start, end).forEach(post => post.style.display = 'block');
        }

        function setupPagination() {
            paginationContainer.innerHTML = '';
            for (let i = 1; i <= pageCount; i++) {
                const link = document.createElement('a');
                link.href = '#';
                link.innerText = i;
                if (i === currentPage) {
                    link.classList.add('active');
                }
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    showPage(currentPage);
                    
                    const currentActive = paginationContainer.querySelector('.active');
                    if (currentActive) {
                        currentActive.classList.remove('active');
                    }
                    link.classList.add('active');
                });
                paginationContainer.appendChild(link);
            }
        }
        
        showPage(1);
        setupPagination();
    }

    // Category Filter Logic
    const categoryButtons = document.querySelectorAll('.categories button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.textContent;
            const filteredPosts = (category === 'All')
                ? allPosts
                : allPosts.filter(post => post.dataset.category === category);
            
            displayAndPaginate(filteredPosts);
        });
    });

    // Initial Load
    displayAndPaginate(allPosts);

    // Form Submission Handlers
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            // In a real app, you would validate credentials here
            // For now, we'll just redirect to the profile page
            window.location.href = 'profile.html';
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Signup form submitted');
            // Here you would typically send data to a server
            const formData = new FormData(this);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
        });
    }

    const hotelSearchForm = document.getElementById('hotel-search-form');
    if (hotelSearchForm) {
        hotelSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Hotel search form submitted');
            const formData = new FormData(this);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            // In a real app, you would now fetch search results
        });
    }

    const flightSearchForm = document.getElementById('flight-search-form');
    if (flightSearchForm) {
        flightSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Flight search form submitted');
            const formData = new FormData(this);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            // In a real app, you would now fetch search results
        });
    }

    const trainSearchForm = document.getElementById('train-search-form');
    if (trainSearchForm) {
        trainSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Train search form submitted');
            const formData = new FormData(this);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            // In a real app, you would now fetch search results
        });
    }

    const carRentalForm = document.getElementById('car-rental-form');
    if (carRentalForm) {
        carRentalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Car rental form submitted');
            const formData = new FormData(this);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            // In a real app, you would now fetch search results
        });
    }
});
const postsData = {
    'a-journey-through-time': {
        title: 'A Journey Through Time: The World\'s Most Beautiful Libraries',
        author: 'Dr. Evelyn Reed',
        date: '12 Jan 2025',
        image: '../images/pexels-benni-fish-40038242-12418421.jpg',
        content: `
            <h2>The Dawn of Written Words</h2>
            <p>Our journey begins not in a grand, vaulted hall, but in the humble clay tablet houses of ancient Mesopotamia. Here, the first form of writing, cuneiform, was meticulously inscribed onto wet clay, preserving records of laws, transactions, and epic tales like that of Gilgamesh. These were the first archives, the precursors to the libraries we know today, born from the fundamental human need to record and preserve knowledge.</p>
            <p>Imagine the quiet reverence of a scribe, pressing a reed stylus into clay, each mark a testament to a civilization's intellectual awakening. These were not just records; they were the seeds of history, philosophy, and literature, waiting for centuries to be rediscovered and understood.</p>
            <h2>Alexandria: The Beacon of the Ancient World</h2>
            <p>No discussion of libraries is complete without mentioning the legendary Library of Alexandria. Founded in the 3rd century BC, it was an unparalleled center of learning, attracting scholars, scientists, and philosophers from across the known world. It is said to have housed hundreds of thousands of scrolls, a collection so vast it represented the sum of human knowledge at the time.</p>
            <p>While its tragic destruction remains a cautionary tale about the fragility of knowledge, its legacy endures as a symbol of intellectual ambition and the universal pursuit of wisdom. It set a standard for what a library could be: not just a repository of texts, but a vibrant, living institution for research and debate.</p>
        `
    },
    'the-art-of-slow-travel': {
        title: 'The Art of Slow Travel: A Guide to Mindful Exploration',
        author: 'Marco Vance',
        date: '18 Jan 2025',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        content: `
            <h2>Embracing the Journey, Not Just the Destination</h2>
            <p>In a world that prizes speed and efficiency, slow travel is a revolutionary act. It’s about consciously choosing to move through the world at a more natural pace, allowing for deeper connections with the places, cultures, and people you encounter. Instead of a whirlwind tour of landmarks, it’s about savoring a morning coffee at a local cafe, spending an afternoon wandering without a map, or learning a few phrases of the local language.</p>
            <p>This approach transforms travel from a checklist of sights to a rich, immersive experience. It’s about quality over quantity, and presence over performance.</p>
        `
    },
    'hidden-culinary-gems': {
        title: 'Hidden Culinary Gems: Finding the Best Local Eats',
        author: 'Anya Sharma',
        date: '22 Jan 2025',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        content: `
            <h2>Beyond the Tourist Traps</h2>
            <p>The true flavor of a destination is rarely found in the polished restaurants of its main tourist square. It’s in the bustling morning markets, the family-run trattorias tucked away in quiet side streets, and the humble food stalls where locals queue for their favorite meal. Finding these hidden culinary gems is an adventure in itself, a delicious treasure hunt that rewards the curious and the brave.</p>
            <p>Ask for recommendations, be willing to try something new, and don't be afraid to eat where the menu isn't in English. These are the places where you'll find not just food, but stories, traditions, and a true taste of the local culture.</p>
        `
    },
    'urban-exploration': {
        title: 'Urban Exploration: Finding Adventure in the City',
        author: 'Leo Chen',
        date: '25 Jan 2025',
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        content: `
            <h2>The City as a Playground</h2>
            <p>Adventure isn't just found on mountain peaks or in dense jungles; it thrives in the heart of our cities. Urban exploration is the art of seeing the familiar with new eyes, of discovering the hidden layers of history, art, and nature that exist within the concrete landscapes we call home. It’s about finding abandoned subway stations, rooftop gardens, and vibrant street art in unexpected places.</p>
        `
    },
    'sustainable-travel': {
        title: 'Sustainable Travel: How to Be a Responsible Tourist',
        author: 'Greta Thorne',
        date: '30 Jan 2025',
        image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        content: `
            <h2>Leaving a Positive Footprint</h2>
            <p>Responsible tourism is about making simple choices that have a positive impact on the places we visit. It means supporting local economies by staying in locally-owned accommodations and eating at local restaurants. It means respecting cultural norms, reducing our environmental impact by conserving water and reducing waste, and leaving places better than we found them. It's a mindset that enriches our own travel experiences while preserving the beauty and integrity of our destination for future generations.</p>
        `
    },
    'a-digital-nomads-guide': {
        title: 'A Digital Nomad\'s Guide to Working from Anywhere',
        author: 'Alex Riley',
        date: '02 Feb 2025',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        content: `
            <h2>The World is Your Office</h2>
            <p>The digital nomad lifestyle offers the ultimate freedom: the ability to blend work and travel, to trade a corner office for a beachfront cafe. But this freedom comes with its own set of challenges. Success requires discipline, adaptability, and a solid toolkit of tech and strategies. From finding reliable Wi-Fi to managing time zones and maintaining productivity, this guide covers the essentials for thriving as a professional who has made the world their office.</p>
        `
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Single Post Page Logic
    const isPostPage = document.querySelector('.single-post-page');
    if (isPostPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        const post = postsData[postId];

        if (post) {
            document.querySelector('.post-title').textContent = post.title;
            document.querySelector('.post-author').textContent = post.author;
            document.querySelector('.post-date').textContent = post.date;
            document.querySelector('.post-image img').src = post.image;
            document.querySelector('.post-image img').alt = post.title;
            document.querySelector('.post-content-body').innerHTML = post.content;
            // Update the page title as well
            document.title = post.title + " - Horizone";
        } else {
            // Handle case where post is not found
            document.querySelector('.post-full-content').innerHTML = '<h1>Post not found</h1><p>The article you are looking for does not exist.</p>';
        }
    }
});