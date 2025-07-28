document.addEventListener('DOMContentLoaded', function() {
    // --- SECURITY UTILITY FUNCTIONS ---

    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    function validateTextInput(text, maxLength = 1000) {
        return typeof text === 'string' && text.trim().length > 0 && text.length <= maxLength;
    }

    function rateLimitCheck(action, limit = 5, timeWindow = 60000) {
        const now = Date.now();
        const key = `rateLimit_${action}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');

        // Remove old attempts outside time window
        const recentAttempts = attempts.filter(time => now - time < timeWindow);

        if (recentAttempts.length >= limit) {
            return false; // Rate limit exceeded
        }

        recentAttempts.push(now);
        localStorage.setItem(key, JSON.stringify(recentAttempts));
        return true;
    }

    // --- UTILITY FUNCTIONS FOR USER MANAGEMENT ---

    function getUsers() {
        return JSON.parse(localStorage.getItem('users_db') || '[]');
    }

    function setUsers(users) {
        localStorage.setItem('users_db', JSON.stringify(users));
    }

    function getCurrentUserEmail() {
        return localStorage.getItem('currentUserEmail');
    }

    function setCurrentUserEmail(email) {
        localStorage.setItem('currentUserEmail', email);
    }

    function getCurrentUser() {
        const email = getCurrentUserEmail();
        if (!email) return null;
        const users = getUsers();
        const user = users.find(u => u.email === email);

        // Debug logging
        if (!user && email) {
            console.warn('User email found in localStorage but user not found in users database:', email);
            console.log('Available users:', users.map(u => u.email));
            // Clear invalid session
            localStorage.removeItem('currentUserEmail');
        }

        return user || null;
    }
    
    function updateUser(updatedUser) {
        if (!updatedUser || !updatedUser.email) return;
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === updatedUser.email);
        if (userIndex > -1) {
            users[userIndex] = updatedUser;
            setUsers(users);
        }
    }

    function getLocalPosts() {
        return JSON.parse(localStorage.getItem('user_posts') || '{}');
    }

    function setLocalPosts(posts) {
        localStorage.setItem('user_posts', JSON.stringify(posts));
    }

    function getPostComments() {
        return JSON.parse(localStorage.getItem('post_comments') || '{}');
    }

    function setPostComments(comments) {
        localStorage.setItem('post_comments', JSON.stringify(comments));
    }

    function logout() {
        localStorage.removeItem('currentUserEmail');
        const homePageUrl = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        window.location.href = homePageUrl;
    }

    // --- THEME/DARK MODE LOGIC ---
    function handleTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const thumbIcon = themeToggle.querySelector('.theme-switch-thumb i');
        
        const applyTheme = (theme) => {
            document.body.classList.toggle('dark-mode', theme === 'dark');
            if (thumbIcon) {
                thumbIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
            localStorage.setItem('theme', theme);
        };

        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
        });

        // Set initial theme on page load
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (prefersDark) {
            applyTheme('dark');
        }
    }

    // --- UI UPDATE FUNCTIONS ---

    function updateNavBasedOnLoginState() {
        const currentUser = getCurrentUser();
        const userActions = document.getElementById('user-actions');
        if (!userActions) {
            console.warn('user-actions element not found on this page');
            return;
        }

        const isPagesDirectory = window.location.pathname.includes('/pages/');

        console.log('Updating navigation for user:', currentUser ? currentUser.name : 'Not logged in');

        if (currentUser) {
            const profilePageUrl = isPagesDirectory ? 'profile.html' : 'pages/profile.html';
            userActions.innerHTML = `
                <a href="${profilePageUrl}" class="profile-link">Hello, ${currentUser.name}</a>
                <a href="#" class="logout-btn signup">Log Out</a>
            `;
            // Re-add event listener for the new logout button
            const logoutBtn = userActions.querySelector('.logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Logout button clicked');
                    logout();
                });
            }
        } else {
            const loginPageUrl = isPagesDirectory ? 'Login.html' : 'pages/Login.html';
            const signupPageUrl = isPagesDirectory ? 'signup.html' : 'pages/signup.html';
            userActions.innerHTML = `
                <a href="${loginPageUrl}" class="login">Log In</a>
                <a href="${signupPageUrl}" class="signup">Sign Up</a>
            `;
        }
    }

    // --- FORM SUBMISSION HANDLERS ---

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = signupForm.querySelector('#name').value.trim();
            const email = signupForm.querySelector('#email').value.trim();
            const password = signupForm.querySelector('#password').value; // In a real app, hash this!

            const users = getUsers();
            if (users.some(u => u.email === email)) {
                return alert('This email is already registered.');
            }

            users.push({ name, email, password, savedArticles: [] });
            setUsers(users);
            setCurrentUserEmail(email);
            window.location.href = 'profile.html';
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = loginForm.querySelector('#email').value.trim();
            const password = loginForm.querySelector('#password').value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                setCurrentUserEmail(email);
                window.location.href = 'profile.html';
            } else {
                alert('Invalid email or password.');
            }
        });
    }

    // --- FEATURE-SPECIFIC LOGIC ---

    function initializePostPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        const postFullContent = document.querySelector('.post-full-content');

        if (!postId) {
            if (postFullContent) postFullContent.innerHTML = '<h1>Post not found</h1><p>The article you are looking for does not exist.</p>';
            return;
        }

        const allPosts = { ...postsData, ...getLocalPosts() };
        const post = allPosts[postId];

        if (post) {
            document.title = post.title + " - Horizone";
            document.querySelector('.post-title').textContent = post.title;
            document.querySelector('.post-author').textContent = post.author;
            document.querySelector('.post-date').textContent = post.date;
            const imgEl = document.querySelector('.post-image img');
            if (imgEl) {
                // Handle local file paths, external URLs, and Data URLs
                const isExternalOrData = post.image.startsWith('http') || post.image.startsWith('data:');
                imgEl.src = isExternalOrData ? post.image : `../${post.image}`;
                imgEl.alt = post.title;

                // Add error handling for broken images
                imgEl.onerror = function() {
                    console.warn('Failed to load image:', post.image);
                    this.src = 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=2070&auto=format&fit=crop';
                };
            }
            document.querySelector('.post-content-body').innerHTML = post.content;
        } else {
            if (postFullContent) postFullContent.innerHTML = '<h1>Post not found</h1><p>The post you are looking for does not exist.</p>';
            return;
        }

        // --- Comments Logic ---
        const currentUser = getCurrentUser();
        const commentForm = document.getElementById('comment-form');
        const commentLoginPrompt = document.getElementById('comment-login-prompt');
        const commentsList = document.getElementById('comments-list');

        if (currentUser) {
            commentForm.style.display = 'block';
            commentLoginPrompt.style.display = 'none';
        } else {
            commentForm.style.display = 'none';
            commentLoginPrompt.style.display = 'block';
        }

        const renderComments = () => {
            const allComments = getPostComments();
            const postComments = allComments[postId] || [];
            commentsList.innerHTML = '';

            if (postComments.length === 0) {
                commentsList.innerHTML = '<p>Be the first to comment on this post.</p>';
                return;
            }

            postComments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment-item');
                const authorInitial = comment.author ? sanitizeInput(comment.author).charAt(0).toUpperCase() : '?';

                commentElement.innerHTML = `
                    <div class="comment-avatar">${authorInitial}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${sanitizeInput(comment.author)}</span>
                            <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p class="comment-body">${sanitizeInput(comment.text)}</p>
                    </div>
                `;
                commentsList.appendChild(commentElement);
            });
        };
        
        renderComments();

        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const commentTextArea = document.getElementById('comment-text');
                const commentText = commentTextArea.value.trim();

                // Validate input and check rate limiting
                if (!validateTextInput(commentText, 2000)) {
                    alert('Please enter a valid comment (1-2000 characters).');
                    return;
                }

                if (!rateLimitCheck('comment', 3, 60000)) {
                    alert('Too many comments submitted. Please wait a minute before commenting again.');
                    return;
                }

                if (commentText && currentUser) {
                    const newComment = {
                        author: sanitizeInput(currentUser.name),
                        text: sanitizeInput(commentText),
                        date: new Date().toISOString()
                    };

                    const allComments = getPostComments();
                    if (!allComments[postId]) {
                        allComments[postId] = [];
                    }
                    allComments[postId].push(newComment);
                    setPostComments(allComments);

                    commentTextArea.value = '';
                    renderComments();
                }
            });
        }
    }

    function initializeCreatePostPage() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'Login.html';
            return;
        }

        let uploadedImageDataUrl = null;
        const createPostForm = document.getElementById('create-post-form');
        const imageUploadContainer = document.getElementById('image-upload-container');
        const imageInput = document.getElementById('post-image-input');
        const imagePreview = document.getElementById('image-preview');
        const imageUploadPrompt = document.querySelector('.image-upload-prompt');

        const handleImageFile = (file) => {
            if (file && file.type.startsWith('image/')) {
                // Check file size (limit to 5MB for localStorage compatibility)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image file is too large. Please select an image smaller than 5MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    uploadedImageDataUrl = reader.result;
                    imagePreview.src = uploadedImageDataUrl;
                    imagePreview.classList.remove('image-preview-hidden');
                    imageUploadPrompt.style.display = 'none';
                    console.log('Image uploaded successfully, size:', Math.round(uploadedImageDataUrl.length / 1024), 'KB');
                };
                reader.onerror = () => {
                    alert('Error reading the image file. Please try again.');
                    console.error('FileReader error:', reader.error);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select a valid image file.');
            }
        };

        if (imageUploadContainer) {
            imageUploadContainer.addEventListener('click', () => imageInput.click());
            
            imageUploadContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                imageUploadContainer.classList.add('drag-over');
            });
            
            imageUploadContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                imageUploadContainer.classList.remove('drag-over');
            });

            imageUploadContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                imageUploadContainer.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                handleImageFile(file);
            });

            imageUploadContainer.addEventListener('paste', (e) => {
                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                for (const item of items) {
                    if (item.kind === 'file') {
                        const file = item.getAsFile();
                        handleImageFile(file);
                        break;
                    }
                }
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                handleImageFile(file);
            });
        }
        
        if (createPostForm) {
            createPostForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // Ensure TinyMCE content is saved to the textarea
                if (tinymce.get('post-content')) {
                    tinymce.triggerSave();
                }

                const title = document.getElementById('post-title').value.trim();
                const category = document.getElementById('post-category').value;
                const content = tinymce.get('post-content').getContent();

                // Validate inputs
                if (!validateTextInput(title, 200)) {
                    alert('Please enter a valid title (1-200 characters).');
                    return;
                }

                if (!validateTextInput(content, 10000)) {
                    alert('Please enter valid content (1-10000 characters).');
                    return;
                }

                if (!category) {
                    alert('Please select a category.');
                    return;
                }

                // Check rate limiting for post creation
                if (!rateLimitCheck('createPost', 2, 300000)) { // 2 posts per 5 minutes
                    alert('Too many posts created recently. Please wait 5 minutes before creating another post.');
                    return;
                }

                const postId = sanitizeInput(title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '');

                const newPost = {
                    id: postId,
                    title: sanitizeInput(title),
                    author: sanitizeInput(currentUser.name),
                    date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                    category: sanitizeInput(category),
                    image: uploadedImageDataUrl || 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=2070&auto=format&fit=crop', // Use Data URL or fallback
                    content: content // TinyMCE content is already sanitized
                };

                console.log('Creating new post:', {
                    id: postId,
                    title: title,
                    hasImage: !!uploadedImageDataUrl,
                    imageType: uploadedImageDataUrl ? (uploadedImageDataUrl.startsWith('data:') ? 'Data URL' : 'Other') : 'Fallback',
                    imageSize: uploadedImageDataUrl ? Math.round(uploadedImageDataUrl.length / 1024) + 'KB' : 'N/A'
                });

                const localPosts = getLocalPosts();
                localPosts[postId] = newPost;
                setLocalPosts(localPosts);

                console.log('Post saved to localStorage, redirecting to post page...');
                window.location.href = `post.html?id=${postId}`;
            });
        }
    }

    function handleSaveActions() {
        const currentUser = getCurrentUser();
        if (!currentUser) { // For non-logged in users, just hide all save functionality
            document.querySelectorAll('.blog-post .post-actions').forEach(postActions => {
                postActions.style.display = 'none';
            });
            const saveBtnSingle = document.querySelector('.save-btn-single');
            if (saveBtnSingle) {
                saveBtnSingle.style.display = 'none';
            }
            return;
        }

        // For main blog grid
        document.querySelectorAll('.blog-post .post-actions').forEach(postActions => {
            const postElement = postActions.closest('.blog-post');
            const postId = postElement.dataset.postId;
            
            postActions.style.display = 'block'; // Show the three-dot menu container

            const optionsBtn = postElement.querySelector('.options-btn');
            const optionsMenu = postElement.querySelector('.options-menu');
            const saveBtn = postElement.querySelector('.save-btn');
            const saveBtnIcon = saveBtn.querySelector('i');
            const saveBtnText = saveBtn.querySelector('span');

            const updateSaveButtonState = () => {
                if (currentUser.savedArticles.includes(postId)) {
                    saveBtnIcon.className = 'fas fa-bookmark';
                    saveBtnText.textContent = 'Unsave';
                } else {
                    saveBtnIcon.className = 'far fa-bookmark';
                    saveBtnText.textContent = 'Save';
                }
            };
            updateSaveButtonState();

            optionsBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                optionsMenu.classList.toggle('show');
            });

            saveBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const index = currentUser.savedArticles.indexOf(postId);
                if (index > -1) {
                    currentUser.savedArticles.splice(index, 1);
                } else {
                    currentUser.savedArticles.push(postId);
                }
                updateUser(currentUser);
                updateSaveButtonState();
                optionsMenu.classList.remove('show');
            });
        });

        // For single post page
        const saveBtnSingle = document.querySelector('.save-btn-single');
        if (saveBtnSingle) {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            const saveBtnIcon = saveBtnSingle.querySelector('i');
            const saveBtnText = saveBtnSingle.querySelector('span');
            
            saveBtnSingle.style.display = 'inline-flex';

            const updateSaveButtonState = () => {
                if (currentUser.savedArticles.includes(postId)) {
                    saveBtnIcon.className = 'fas fa-bookmark';
                    saveBtnText.textContent = 'Unsave';
                } else {
                    saveBtnIcon.className = 'far fa-bookmark';
                    saveBtnText.textContent = 'Save';
                }
            };
            updateSaveButtonState();

            saveBtnSingle.addEventListener('click', () => {
                const index = currentUser.savedArticles.indexOf(postId);
                if (index > -1) {
                    currentUser.savedArticles.splice(index, 1);
                } else {
                    currentUser.savedArticles.push(postId);
                }
                updateUser(currentUser);
                updateSaveButtonState();
            });
        }
    }

    function initializeProfilePage() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'Login.html';
            return;
        }

        const profileNameElement = document.querySelector('.profile-header h1');
        if (profileNameElement) {
            profileNameElement.textContent = currentUser.name;
        }

        const savedArticlesContainer = document.getElementById('saved-articles-section');
        if (savedArticlesContainer) {
            const allPosts = { ...postsData, ...getLocalPosts() };
            if (currentUser.savedArticles && currentUser.savedArticles.length > 0) {
                savedArticlesContainer.innerHTML = '<h2>My Saved Articles</h2><div class="saved-articles-grid"></div>';
                const grid = savedArticlesContainer.querySelector('.saved-articles-grid');
                currentUser.savedArticles.forEach(postId => {
                    const post = allPosts[postId];
                    if (post) {
                        const postElement = document.createElement('a');
                        postElement.href = `post.html?id=${post.id}`;
                        postElement.classList.add('blog-post');
                        // Handle different image types: Data URLs, external URLs, and local paths
                        const imageSrc = post.image.startsWith('data:') || post.image.startsWith('http')
                            ? post.image
                            : '../' + post.image;

                        postElement.innerHTML = `
                            <img src="${imageSrc}" alt="${post.title}" onerror="this.src='https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=2070&auto=format&fit=crop'">
                            <div class="post-content">
                                <h3>${post.title}</h3>
                                <div class="post-meta">
                                    <span>${post.date}</span>
                                </div>
                            </div>
                        `;
                        grid.appendChild(postElement);
                    }
                });
            } else {
                savedArticlesContainer.innerHTML = '<h2>My Saved Articles</h2><p>You have no saved articles yet.</p>';
            }
        }
    }
    
    // --- INITIALIZATION ON PAGE LOAD ---

    // Initialize core functionality
    function initializeApp() {
        handleTheme();
        updateNavBasedOnLoginState();
        handleSaveActions();

        // Debug logging for authentication state
        const currentUser = getCurrentUser();
        console.log('Current user on page load:', currentUser ? currentUser.name : 'Not logged in');
        console.log('Current page:', window.location.pathname);
    }

    // Call initialization immediately
    initializeApp();

    // Also call on page visibility change (when user switches tabs and comes back)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateNavBasedOnLoginState();
        }
    });

    const createPostTile = document.getElementById('create-post-tile');
    if (createPostTile) {
        const currentUser = getCurrentUser();
        if (currentUser) {
            createPostTile.style.display = 'flex';
        }
    }

    // Close open menus when clicking anywhere
    window.addEventListener('click', () => {
        document.querySelectorAll('.options-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });

    // Page-specific initializations
    const isProfilePage = document.querySelector('.profile-page');
    if (isProfilePage) {
        initializeProfilePage();
    }

    const isCreatePostPage = document.querySelector('.create-post-page');
    if (isCreatePostPage) {
        initializeCreatePostPage();
    }

    const isPostPage = document.querySelector('.single-post-page');
    if (isPostPage) {
        initializePostPage();
    }

    let allPosts = [];
    const paginationContainer = document.querySelector('.pagination');
    const postsPerPage = 6;
    let fuse;

    function showPage(posts, page) {
        allPosts.forEach(post => post.style.display = 'none');
        const start = (page - 1) * postsPerPage;
        const end = start + postsPerPage;
        posts.slice(start, end).forEach(post => {
            const postElement = document.querySelector(`.blog-post[data-post-id='${post.dataset.postId}']`);
            if (postElement) {
                postElement.style.display = 'block';
            }
        });
    }

    function setupPagination(posts) {
        if (!paginationContainer) return;
        const pageCount = Math.ceil(posts.length / postsPerPage);
        paginationContainer.innerHTML = '';

        if (pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            const link = document.createElement('a');
            link.href = '#';
            link.innerText = i;
            if (i === 1) {
                link.classList.add('active');
            }
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(posts, i);
                
                const currentActive = paginationContainer.querySelector('.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                link.classList.add('active');
            });
            paginationContainer.appendChild(link);
        }
    }

    function displayPosts(filteredPosts) {
        showPage(filteredPosts, 1);
        setupPagination(filteredPosts);
    }
    
    const categoryButtons = document.querySelectorAll('.categories button');
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.textContent;
                const filteredPosts = (category === 'All')
                    ? allPosts
                    : allPosts.filter(post => post.dataset.category === category);
                
                displayPosts(filteredPosts);
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
            });
        });
    }
    
    const otherForms = ['hotel-search-form', 'flight-search-form', 'train-search-form', 'car-rental-form'];
    otherForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log(`${formId} submitted`);
            });
        }
    });

    // Enhanced Search Functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Helper function to strip HTML tags and decode entities
        function stripHtmlAndDecode(html) {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            return temp.textContent || temp.innerText || '';
        }

        // Enhanced Fuse.js options for better search
        const fuseOptions = {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'content', weight: 0.3 },
                { name: 'author', weight: 0.1 },
                { name: 'category', weight: 0.2 }
            ],
            includeScore: true,
            includeMatches: true,
            threshold: 0.3, // More strict for better relevance
            ignoreLocation: true,
            minMatchCharLength: 2,
            shouldSort: true
        };

        // Prepare searchable posts with full content
        const allPostsData = { ...postsData, ...getLocalPosts() };
        const searchablePosts = Object.values(allPostsData).map(post => {
            return {
                id: post.id,
                title: post.title,
                content: stripHtmlAndDecode(post.content || ''),
                author: post.author || '',
                category: post.category || ''
            };
        });

        fuse = new Fuse(searchablePosts, fuseOptions);

        // Create search results container
        let searchResultsContainer = document.querySelector('.search-results-info');
        if (!searchResultsContainer) {
            searchResultsContainer = document.createElement('div');
            searchResultsContainer.className = 'search-results-info';
            const blogSection = document.querySelector('.blog-section');
            if (blogSection) {
                const blogFilters = blogSection.querySelector('.blog-filters');
                if (blogFilters) {
                    blogFilters.insertAdjacentElement('afterend', searchResultsContainer);
                }
            }
        }

        // Enhanced search with debouncing
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();

            // Clear previous timeout
            clearTimeout(searchTimeout);

            // Debounce search for better performance
            searchTimeout = setTimeout(() => {
                if (query !== '') {
                    performSearch(query);
                } else {
                    clearSearch();
                }
            }, 300); // 300ms delay
        });

        function performSearch(query) {
            const results = fuse.search(query);
            const resultIds = new Set(results.map(result => result.item.id));
            const filteredPosts = allPosts.filter(postEl => resultIds.has(postEl.dataset.postId));

            // Display search results info
            displaySearchResults(query, results.length, filteredPosts.length);

            // Highlight search terms in results
            highlightSearchTerms(query, filteredPosts);

            // Display filtered posts
            displayPosts(filteredPosts);

            // Clear category selection
            if (categoryButtons.length > 0) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
            }
        }

        function clearSearch() {
            // Clear search results info
            searchResultsContainer.innerHTML = '';

            // Remove highlighting
            removeSearchHighlights();

            // Restore original view
            if (document.querySelector('.categories button.active')) {
                document.querySelector('.categories button.active').click();
            } else if (categoryButtons.length > 0) {
                categoryButtons[0].click();
            }
        }

        function displaySearchResults(query, totalMatches, visibleResults) {
            searchResultsContainer.innerHTML = `
                <div class="search-results-summary">
                    <i class="fas fa-search"></i>
                    <span>Found ${totalMatches} result${totalMatches !== 1 ? 's' : ''} for "${sanitizeInput(query)}"</span>
                    ${visibleResults !== totalMatches ? `<span class="results-note">(${visibleResults} visible)</span>` : ''}
                    <button class="clear-search-btn" title="Clear search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            // Add clear search functionality
            const clearBtn = searchResultsContainer.querySelector('.clear-search-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    clearSearch();
                });
            }
        }

        function highlightSearchTerms(query, posts) {
            const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);

            posts.forEach(post => {
                const titleElement = post.querySelector('h3');
                const contentElements = post.querySelectorAll('.post-content');

                if (titleElement) {
                    highlightInElement(titleElement, terms);
                }

                contentElements.forEach(element => {
                    highlightInElement(element, terms);
                });
            });
        }

        function highlightInElement(element, terms) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }

            textNodes.forEach(textNode => {
                let text = textNode.textContent;
                let highlightedText = text;

                terms.forEach(term => {
                    const regex = new RegExp(`(${term})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
                });

                if (highlightedText !== text) {
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = highlightedText;
                    textNode.parentNode.replaceChild(wrapper, textNode);
                }
            });
        }

        function removeSearchHighlights() {
            const highlights = document.querySelectorAll('.search-highlight');
            highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            });
        }
    }

    if (document.querySelector('.blog-grid')) {
        const localPosts = getLocalPosts();
        const grid = document.querySelector('.blog-grid');
        const isIndexPage = !window.location.pathname.includes('/pages/');

        Object.values(localPosts).forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('blog-post');
            postElement.dataset.postId = post.id;
            postElement.dataset.category = post.category;
            
            const postLink = isIndexPage ? `pages/post.html?id=${post.id}` : `post.html?id=${post.id}`;
            // Handle different image types: Data URLs, external URLs, and local paths
            const imagePath = post.image.startsWith('data:') || post.image.startsWith('http')
                ? post.image
                : (isIndexPage ? post.image : `../${post.image}`);

            postElement.innerHTML = `
                <a href="${postLink}">
                    <img src="${imagePath}" alt="${post.title}" onerror="this.src='https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=2070&auto=format&fit=crop'">
                </a>
                <div class="post-content">
                    <span class="tag">${post.category}</span>
                    <h3><a href="${postLink}">${post.title}</a></h3>
                    <div class="post-meta">
                        <span>${post.date}</span>
                    </div>
                    <div class="author-info">
                        <p>By ${post.author}</p>
                    </div>
                </div>
                <div class="post-actions" style="display: none;">
                    <button class="options-btn"><i class="fas fa-ellipsis-h"></i></button>
                    <div class="options-menu">
                        <button class="save-btn">
                            <i class="far fa-bookmark"></i>
                            <span>Save</span>
                        </button>
                    </div>
                </div>
            `;
            grid.prepend(postElement);
        });
        
        allPosts = Array.from(document.querySelectorAll('.blog-grid .blog-post'));
        handleSaveActions();

       if (categoryButtons.length > 0 && document.querySelector('.categories button')) {
            document.querySelector('.categories button').click();
       }
    }

    // --- SOCIAL SHARING FUNCTIONALITY ---
    function initializeSocialSharing() {
        const sharingButtons = document.querySelectorAll('.share-btn');
        const shareFeedback = document.getElementById('share-feedback');

        if (sharingButtons.length === 0) return;

        // Get current page information
        const currentUrl = window.location.href;
        const pageTitle = document.title;
        const postTitle = document.querySelector('.post-title')?.textContent || pageTitle;
        const postDescription = document.querySelector('meta[name="description"]')?.content ||
                               'Check out this article on Horizone Travel Blog';

        sharingButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const platform = this.dataset.platform;
                handleShare(platform, currentUrl, postTitle, postDescription);
            });
        });

        function handleShare(platform, url, title, description) {
            let shareUrl = '';
            const encodedUrl = encodeURIComponent(url);
            const encodedTitle = encodeURIComponent(title);
            const encodedDescription = encodeURIComponent(description);

            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
                    break;
                case 'copy':
                    copyToClipboard(url);
                    return;
            }

            if (shareUrl) {
                // Open sharing window
                const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes';
                window.open(shareUrl, 'share', windowFeatures);

                // Show feedback
                showShareFeedback(`Shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);
            }
        }

        function copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                // Use modern clipboard API
                navigator.clipboard.writeText(text).then(() => {
                    showShareFeedback('Link copied to clipboard!');
                    updateCopyButton(true);
                }).catch(() => {
                    fallbackCopyToClipboard(text);
                });
            } else {
                // Fallback for older browsers
                fallbackCopyToClipboard(text);
            }
        }

        function fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                showShareFeedback('Link copied to clipboard!');
                updateCopyButton(true);
            } catch (err) {
                showShareFeedback('Failed to copy link. Please copy manually.');
            }

            document.body.removeChild(textArea);
        }

        function updateCopyButton(copied) {
            const copyBtn = document.querySelector('.copy-link');
            if (copyBtn) {
                if (copied) {
                    copyBtn.classList.add('copied');
                    const span = copyBtn.querySelector('span');
                    const originalText = span.textContent;
                    span.textContent = 'Copied!';

                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        span.textContent = originalText;
                    }, 2000);
                }
            }
        }

        function showShareFeedback(message) {
            if (shareFeedback) {
                shareFeedback.textContent = message;
                shareFeedback.classList.add('show');

                setTimeout(() => {
                    shareFeedback.classList.remove('show');
                }, 3000);
            }
        }
    }

    // Initialize social sharing on post pages
    if (window.location.pathname.includes('post.html')) {
        // Wait for post content to load before initializing sharing
        setTimeout(initializeSocialSharing, 1000);
    }

    // --- PERFORMANCE OPTIMIZATION ---

    // Image Lazy Loading
    function initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('lazy-loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('lazy-loaded');
            });
        }
    }

    // Convert existing images to lazy loading
    function convertImagesToLazyLoading() {
        const images = document.querySelectorAll('img:not([data-src])');
        images.forEach(img => {
            if (img.src && !img.src.includes('data:')) {
                img.dataset.src = img.src;
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                img.classList.add('lazy');
            }
        });
    }

    // Resource Preloading
    function preloadCriticalResources() {
        const criticalImages = [
            'images/pexels-benni-fish-40038242-12418421.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Performance Monitoring
    function initializePerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;

                    // Store performance data in localStorage for analysis
                    const perfLog = JSON.parse(localStorage.getItem('performance_log') || '[]');
                    perfLog.push({
                        timestamp: new Date().toISOString(),
                        page: window.location.pathname,
                        loadTime: loadTime,
                        domContentLoaded: domContentLoaded,
                        totalTime: perfData.loadEventEnd - perfData.navigationStart
                    });

                    // Keep only last 50 entries
                    if (perfLog.length > 50) {
                        perfLog.splice(0, perfLog.length - 50);
                    }

                    localStorage.setItem('performance_log', JSON.stringify(perfLog));
                }, 0);
            });
        }
    }

    // --- ACCESSIBILITY IMPROVEMENTS ---

    function initializeAccessibility() {
        // Add skip navigation link
        addSkipNavigation();

        // Enhance keyboard navigation
        enhanceKeyboardNavigation();

        // Add ARIA labels where missing
        addAriaLabels();

        // Improve focus management
        improveFocusManagement();
    }

    function addSkipNavigation() {
        const skipNav = document.createElement('a');
        skipNav.href = '#main-content';
        skipNav.className = 'skip-nav';
        skipNav.textContent = 'Skip to main content';
        skipNav.setAttribute('aria-label', 'Skip to main content');
        document.body.insertBefore(skipNav, document.body.firstChild);

        // Add main content landmark if it doesn't exist
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }

    function enhanceKeyboardNavigation() {
        // Make blog post cards keyboard accessible
        const blogPosts = document.querySelectorAll('.blog-post');
        blogPosts.forEach(post => {
            const link = post.querySelector('a');
            if (link) {
                post.setAttribute('tabindex', '0');
                post.setAttribute('role', 'article');
                post.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        link.click();
                    }
                });
            }
        });

        // Enhance search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Search blog posts');
            searchInput.setAttribute('aria-describedby', 'search-description');

            // Add search description
            const searchDesc = document.createElement('div');
            searchDesc.id = 'search-description';
            searchDesc.className = 'sr-only';
            searchDesc.textContent = 'Search through blog posts by title, content, author, or category';
            searchInput.parentNode.insertBefore(searchDesc, searchInput.nextSibling);
        }

        // Enhance category buttons
        const categoryButtons = document.querySelectorAll('.categories button');
        categoryButtons.forEach(button => {
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
                button.setAttribute('aria-pressed', 'true');
            });
        });
    }

    function addAriaLabels() {
        // Add labels to navigation
        const nav = document.querySelector('nav');
        if (nav && !nav.getAttribute('aria-label')) {
            nav.setAttribute('aria-label', 'Main navigation');
        }

        // Add labels to social icons
        const socialIcons = document.querySelectorAll('.social-icons a');
        socialIcons.forEach(icon => {
            const iconClass = icon.querySelector('i').className;
            let platform = 'Social media';
            if (iconClass.includes('facebook')) platform = 'Facebook';
            else if (iconClass.includes('twitter')) platform = 'Twitter';
            else if (iconClass.includes('instagram')) platform = 'Instagram';
            else if (iconClass.includes('linkedin')) platform = 'LinkedIn';

            if (!icon.getAttribute('aria-label')) {
                icon.setAttribute('aria-label', `Visit our ${platform} page`);
            }
        });

        // Add labels to form elements
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                    const label = form.querySelector(`label[for="${input.id}"]`);
                    if (!label && input.placeholder) {
                        input.setAttribute('aria-label', input.placeholder);
                    }
                }
            });
        });

        // Add labels to buttons without text
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            const icon = button.querySelector('i');
            const text = button.textContent.trim();
            if (icon && !text) {
                const iconClass = icon.className;
                let label = 'Button';
                if (iconClass.includes('search')) label = 'Search';
                else if (iconClass.includes('menu')) label = 'Menu';
                else if (iconClass.includes('close')) label = 'Close';
                else if (iconClass.includes('bookmark')) label = 'Save article';

                button.setAttribute('aria-label', label);
            }
        });
    }

    function improveFocusManagement() {
        // Add focus indicators for custom elements
        const focusableElements = document.querySelectorAll('.blog-post, .share-btn, .category-btn');
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });

        // Trap focus in modals (if any are added later)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });
    }

    // Initialize performance optimizations
    convertImagesToLazyLoading();
    initializeLazyLoading();
    preloadCriticalResources();
    initializePerformanceMonitoring();

    // Initialize accessibility improvements
    initializeAccessibility();

    // --- DEBUGGING AND TESTING FUNCTIONS ---

    // Add debugging functions to window for testing
    window.debugBlog = {
        getCurrentUser: getCurrentUser,
        getLocalPosts: getLocalPosts,
        getUsers: getUsers,
        testImageUpload: function() {
            console.log('Testing image upload functionality...');
            const uploadContainer = document.getElementById('image-upload-container');
            const imagePreview = document.getElementById('image-preview');
            console.log('Upload container found:', !!uploadContainer);
            console.log('Image preview found:', !!imagePreview);
            console.log('Current uploaded image:', window.uploadedImageDataUrl ? 'Present' : 'None');
        },
        testAuth: function() {
            console.log('Testing authentication...');
            const currentUser = getCurrentUser();
            const userEmail = getCurrentUserEmail();
            console.log('Current user email in localStorage:', userEmail);
            console.log('Current user object:', currentUser);
            console.log('All users in database:', getUsers().map(u => ({ name: u.name, email: u.email })));
        }
    };

    // --- RELATED POSTS ALGORITHM ---

    function initializeRelatedPosts() {
        if (!window.location.pathname.includes('post.html')) return;

        const urlParams = new URLSearchParams(window.location.search);
        const currentPostId = urlParams.get('id');

        if (!currentPostId) return;

        // Wait for post content to load
        setTimeout(() => {
            const relatedPosts = findRelatedPosts(currentPostId);
            if (relatedPosts.length > 0) {
                displayRelatedPosts(relatedPosts);
            }
        }, 1500);
    }

    function findRelatedPosts(currentPostId, maxResults = 3) {
        const allPostsData = { ...postsData, ...getLocalPosts() };
        const currentPost = allPostsData[currentPostId];

        if (!currentPost) return [];

        const otherPosts = Object.values(allPostsData).filter(post => post.id !== currentPostId);

        // Calculate similarity scores
        const scoredPosts = otherPosts.map(post => {
            let score = 0;

            // Category match (highest weight)
            if (post.category === currentPost.category) {
                score += 50;
            }

            // Author match
            if (post.author === currentPost.author) {
                score += 20;
            }

            // Content similarity (basic keyword matching)
            const currentContent = stripHtmlAndDecode(currentPost.content || '').toLowerCase();
            const postContent = stripHtmlAndDecode(post.content || '').toLowerCase();

            // Extract keywords (simple approach)
            const currentKeywords = extractKeywords(currentContent);
            const postKeywords = extractKeywords(postContent);

            // Calculate keyword overlap
            const commonKeywords = currentKeywords.filter(keyword =>
                postKeywords.includes(keyword)
            );
            score += commonKeywords.length * 5;

            // Title similarity
            const titleSimilarity = calculateTitleSimilarity(currentPost.title, post.title);
            score += titleSimilarity * 10;

            return { post, score };
        });

        // Sort by score and return top results
        return scoredPosts
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .filter(item => item.score > 0)
            .map(item => item.post);
    }

    function extractKeywords(text) {
        // Simple keyword extraction
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];

        return text
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 20); // Limit to top 20 keywords
    }

    function calculateTitleSimilarity(title1, title2) {
        const words1 = title1.toLowerCase().split(/\s+/);
        const words2 = title2.toLowerCase().split(/\s+/);

        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = new Set([...words1, ...words2]).size;

        return totalWords > 0 ? commonWords.length / totalWords : 0;
    }

    function displayRelatedPosts(relatedPosts) {
        const socialSharing = document.getElementById('social-sharing');
        if (!socialSharing) return;

        const relatedSection = document.createElement('section');
        relatedSection.className = 'related-posts';
        relatedSection.innerHTML = `
            <h3>Related Articles</h3>
            <div class="related-posts-grid">
                ${relatedPosts.map(post => `
                    <article class="related-post-card">
                        <a href="post.html?id=${post.id}" class="related-post-link">
                            <div class="related-post-image">
                                <img src="${post.image}" alt="${sanitizeInput(post.title)}" loading="lazy">
                            </div>
                            <div class="related-post-content">
                                <h4 class="related-post-title">${sanitizeInput(post.title)}</h4>
                                <div class="related-post-meta">
                                    <span class="related-post-author">${sanitizeInput(post.author)}</span>
                                    <span class="related-post-category">${sanitizeInput(post.category)}</span>
                                </div>
                            </div>
                        </a>
                    </article>
                `).join('')}
            </div>
        `;

        socialSharing.insertAdjacentElement('afterend', relatedSection);
    }

    // Helper function to strip HTML (reuse from search functionality)
    function stripHtmlAndDecode(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    // Initialize related posts
    initializeRelatedPosts();
});