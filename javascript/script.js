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
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        // Migrate users to new structure if needed
        return migrateUsersData(users);
    }

    function setUsers(users) {
        localStorage.setItem('users_db', JSON.stringify(users));
    }

    // Migration function to add new fields to existing users
    function migrateUsersData(users) {
        let migrationNeeded = false;
        const migratedUsers = users.map(user => {
            const migratedUser = { ...user };

            // Add profileImage field if missing
            if (!migratedUser.hasOwnProperty('profileImage')) {
                migratedUser.profileImage = null;
                migrationNeeded = true;
            }

            // Add joinDate field if missing
            if (!migratedUser.hasOwnProperty('joinDate')) {
                migratedUser.joinDate = new Date().toISOString();
                migrationNeeded = true;
            }

            return migratedUser;
        });

        // Save migrated data if changes were made
        if (migrationNeeded && migratedUsers.length > 0) {
            localStorage.setItem('users_db', JSON.stringify(migratedUsers));
            console.log('User data migrated to include profile image and join date fields');
        }

        return migratedUsers;
    }

    function getCurrentUserEmail() {
        return localStorage.getItem('currentUserEmail');
    }

    function setCurrentUserEmail(email) {
        localStorage.setItem('currentUserEmail', email);
        // Also set session persistence data
        setUserSession(email);
    }

    // --- SESSION PERSISTENCE FUNCTIONS ---

    function setUserSession(email) {
        if (!email) return;

        const sessionData = {
            email: email,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            persistent: true
        };

        localStorage.setItem('userSession', JSON.stringify(sessionData));
        console.log('User session created for:', email);
    }

    function getUserSession() {
        try {
            const sessionData = localStorage.getItem('userSession');
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error parsing user session:', error);
            localStorage.removeItem('userSession');
            return null;
        }
    }

    function updateSessionActivity() {
        const session = getUserSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            localStorage.setItem('userSession', JSON.stringify(session));
        }
    }

    function clearUserSession() {
        localStorage.removeItem('userSession');
        localStorage.removeItem('currentUserEmail');
        console.log('User session cleared');
    }

    function isSessionValid() {
        const session = getUserSession();
        if (!session) return false;

        // Check if session is too old (optional: 30 days)
        const sessionAge = Date.now() - new Date(session.loginTime).getTime();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

        if (sessionAge > maxAge) {
            clearUserSession();
            return false;
        }

        return true;
    }

    function restoreUserSession() {
        const session = getUserSession();
        if (session && isSessionValid()) {
            // Verify user still exists in database
            const users = getUsers();
            const user = users.find(u => u.email === session.email);

            if (user) {
                localStorage.setItem('currentUserEmail', session.email);
                updateSessionActivity();
                console.log('User session restored for:', session.email);
                return true;
            } else {
                // User no longer exists, clear session
                clearUserSession();
                console.log('User no longer exists, session cleared');
                return false;
            }
        }
        return false;
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

    // --- PROFILE IMAGE UTILITY FUNCTIONS ---

    function getUserAvatar(user) {
        if (!user) return null;

        // Return profile image if exists, otherwise return null for fallback to initials
        return user.profileImage || null;
    }

    function getUserAvatarElement(user, size = 'medium') {
        if (!user) return null;

        const sizeClasses = {
            small: 'w-8 h-8 text-sm',
            medium: 'w-12 h-12 text-base',
            large: 'w-24 h-24 text-xl'
        };

        const profileImage = getUserAvatar(user);
        const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

        if (profileImage) {
            return `<img src="${profileImage}" alt="${user.name || 'User'} Avatar" class="profile-avatar ${sizeClasses[size] || sizeClasses.medium}" style="object-fit: cover;">`;
        } else {
            return `<div class="profile-avatar-placeholder ${sizeClasses[size] || sizeClasses.medium}">${initial}</div>`;
        }
    }

    function updateUserProfileImage(email, imageDataUrl) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            users[userIndex].profileImage = imageDataUrl;
            setUsers(users);
            return true;
        }
        return false;
    }

    function removeUserProfileImage(email) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            users[userIndex].profileImage = null;
            setUsers(users);
            return true;
        }
        return false;
    }

    // --- PROFILE IMAGE PROCESSING FUNCTIONS ---

    function debugImageFile(file) {
        console.group('🔍 Image File Debug Information');
        console.log('File name:', file.name);
        console.log('File type:', file.type);
        console.log('File size:', file.size, 'bytes', `(${(file.size / 1024).toFixed(2)} KB)`);
        console.log('Last modified:', new Date(file.lastModified));

        // Check file extension
        const extension = file.name.toLowerCase().split('.').pop();
        console.log('File extension:', extension);

        // Check if MIME type matches extension
        const expectedMimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
        };

        const expectedMime = expectedMimeTypes[extension];
        if (expectedMime && expectedMime !== file.type) {
            console.warn('⚠️ MIME type mismatch:', `Expected ${expectedMime}, got ${file.type}`);
        }

        // Check browser support for the file type
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (file.type === 'image/webp') {
            const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            console.log('WEBP encoding support:', webpSupported ? '✅' : '❌');
        }

        console.groupEnd();

        return {
            name: file.name,
            type: file.type,
            size: file.size,
            extension: extension,
            mimeTypeMatch: !expectedMime || expectedMime === file.type
        };
    }

    function testImageCompatibility() {
        console.group('🧪 Browser Image Compatibility Test');

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        const formats = [
            { name: 'WEBP', mime: 'image/webp' },
            { name: 'PNG', mime: 'image/png' },
            { name: 'JPEG', mime: 'image/jpeg' },
            { name: 'GIF', mime: 'image/gif' },
            { name: 'BMP', mime: 'image/bmp' }
        ];

        formats.forEach(format => {
            try {
                const dataUrl = canvas.toDataURL(format.mime);
                const supported = dataUrl.indexOf(`data:${format.mime}`) === 0;
                console.log(`${format.name} encoding:`, supported ? '✅ Supported' : '❌ Not supported');
            } catch (error) {
                console.log(`${format.name} encoding:`, '❌ Error testing');
            }
        });

        console.groupEnd();
    }

    // Expose test function globally for debugging
    window.testImageCompatibility = testImageCompatibility;

    function validateProfileImageFile(file) {
        // Expanded list of supported MIME types including variations
        const validTypes = [
            'image/webp',
            'image/png',
            'image/jpeg',
            'image/jpg',  // Some browsers report this
            'image/gif',
            'image/svg+xml',
            'image/bmp',  // Basic bitmap support
            'image/x-icon', // ICO files
            'image/vnd.microsoft.icon' // Alternative ICO MIME type
        ];
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        const minSize = 100; // 100 bytes minimum to avoid empty files

        if (!file) {
            return { valid: false, error: 'No file selected.' };
        }

        // Check if file is actually a file object
        if (!(file instanceof File)) {
            return { valid: false, error: 'Invalid file object.' };
        }

        // Check file size constraints
        if (file.size < minSize) {
            return { valid: false, error: 'File is too small or corrupted. Please select a valid image file.' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'File size too large. Please select an image smaller than 2MB.' };
        }

        // Enhanced MIME type validation
        if (!file.type) {
            return { valid: false, error: 'Unable to determine file type. Please ensure you\'re selecting a valid image file.' };
        }

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: `Invalid file format "${file.type}". Please select a WEBP, PNG, JPG, JPEG, GIF, SVG, BMP, or ICO image.` };
        }

        // Additional file extension validation for security
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.ico'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            return { valid: false, error: 'File extension doesn\'t match supported formats. Please ensure your file has a valid image extension.' };
        }

        // Check for suspicious file names
        if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
            return { valid: false, error: 'Invalid file name. Please rename your file and try again.' };
        }

        return { valid: true };
    }

    function compressImage(file, maxSizeKB = 2048, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Set up timeout for image loading
            const loadTimeout = setTimeout(() => {
                reject(new Error('Image loading timed out. The file may be corrupted or too large.'));
            }, 10000); // 10 second timeout

            img.onload = () => {
                clearTimeout(loadTimeout);

                try {
                    // Validate image dimensions
                    const { width, height } = img;

                    if (width === 0 || height === 0) {
                        reject(new Error('Invalid image dimensions. The image appears to be corrupted.'));
                        return;
                    }

                    if (width > 10000 || height > 10000) {
                        reject(new Error('Image dimensions too large. Please use an image smaller than 10000x10000 pixels.'));
                        return;
                    }

                    // Calculate new dimensions while maintaining aspect ratio
                    const maxDimension = 800; // Max width or height
                    let newWidth = width;
                    let newHeight = height;

                    if (width > height && width > maxDimension) {
                        newHeight = (height * maxDimension) / width;
                        newWidth = maxDimension;
                    } else if (height > maxDimension) {
                        newWidth = (width * maxDimension) / height;
                        newHeight = maxDimension;
                    }

                    // Ensure dimensions are integers and not zero
                    newWidth = Math.max(1, Math.round(newWidth));
                    newHeight = Math.max(1, Math.round(newHeight));

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    // Clear canvas and set white background for transparency handling
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, newWidth, newHeight);

                    // Draw and compress with error handling
                    try {
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    } catch (drawError) {
                        reject(new Error('Failed to process image. The file may be corrupted or in an unsupported format.'));
                        return;
                    }

                    // Determine output format based on input file type
                    let outputFormat = 'image/jpeg';
                    let outputQuality = quality;

                    // For PNG files with transparency, try to maintain PNG format
                    if (file.type === 'image/png') {
                        outputFormat = 'image/png';
                        outputQuality = undefined; // PNG doesn't use quality parameter
                    }
                    // For WEBP files, try to maintain WEBP format if browser supports it
                    else if (file.type === 'image/webp') {
                        // Check if browser supports WEBP encoding
                        try {
                            const testCanvas = document.createElement('canvas');
                            testCanvas.width = 1;
                            testCanvas.height = 1;
                            const webpTest = testCanvas.toDataURL('image/webp');
                            const webpSupported = webpTest.indexOf('data:image/webp') === 0;

                            if (webpSupported) {
                                outputFormat = 'image/webp';
                            }
                        } catch (webpError) {
                            console.warn('WEBP support test failed, falling back to JPEG');
                        }
                    }

                    // Try different quality levels to meet size requirement
                    let currentQuality = outputQuality;
                    let dataUrl;
                    let attempts = 0;
                    const maxAttempts = 10;

                    do {
                        try {
                            dataUrl = canvas.toDataURL(outputFormat, currentQuality);
                            const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024); // Approximate size in KB

                            if (sizeKB <= maxSizeKB || currentQuality <= 0.1 || attempts >= maxAttempts) {
                                break;
                            }

                            currentQuality = outputFormat === 'image/png' ? undefined : Math.max(0.1, currentQuality - 0.1);
                            attempts++;
                        } catch (compressionError) {
                            reject(new Error('Failed to compress image. Please try a different image.'));
                            return;
                        }
                    } while (currentQuality > 0.1 && attempts < maxAttempts);

                    if (!dataUrl || dataUrl === 'data:,') {
                        reject(new Error('Failed to generate image data. Please try a different image.'));
                        return;
                    }

                    console.log(`Image compressed: ${file.type} -> ${outputFormat}, Quality: ${currentQuality ? currentQuality.toFixed(1) : 'lossless'}`);
                    resolve(dataUrl);
                } catch (processingError) {
                    reject(new Error(`Image processing failed: ${processingError.message}`));
                }
            };

            img.onerror = (error) => {
                clearTimeout(loadTimeout);
                console.error('Image load error:', error);
                reject(new Error('Failed to load image. The file may be corrupted, in an unsupported format, or too large.'));
            };

            // Create object URL with error handling
            try {
                const objectUrl = URL.createObjectURL(file);
                img.src = objectUrl;

                // Clean up object URL after a delay to prevent memory leaks
                setTimeout(() => {
                    URL.revokeObjectURL(objectUrl);
                }, 30000);
            } catch (urlError) {
                clearTimeout(loadTimeout);
                reject(new Error('Failed to process file. Please try a different image.'));
            }
        });
    }

    function processProfileImage(file) {
        return new Promise((resolve, reject) => {
            console.log('Processing profile image:', file.name, file.type, file.size);

            const validation = validateProfileImageFile(file);
            if (!validation.valid) {
                reject(new Error(validation.error));
                return;
            }

            // Handle special formats that need specific processing
            if (file.type === 'image/svg+xml') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const svgContent = e.target.result;

                        // Basic SVG validation
                        if (!svgContent || typeof svgContent !== 'string') {
                            reject(new Error('Invalid SVG file content'));
                            return;
                        }

                        // Check if content looks like SVG
                        if (!svgContent.trim().toLowerCase().includes('<svg')) {
                            reject(new Error('File does not appear to be a valid SVG'));
                            return;
                        }

                        // Remove potentially dangerous content (basic sanitization)
                        const sanitizedSvg = svgContent
                            .replace(/<script[^>]*>.*?<\/script>/gi, '')
                            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                            .replace(/javascript:/gi, '');

                        try {
                            const dataUrl = `data:image/svg+xml;base64,${btoa(sanitizedSvg)}`;
                            console.log('SVG processed successfully');
                            resolve(dataUrl);
                        } catch (encodingError) {
                            reject(new Error('Failed to encode SVG file. The file may contain invalid characters.'));
                        }
                    } catch (svgError) {
                        reject(new Error('Failed to process SVG file. Please ensure it\'s a valid SVG image.'));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read SVG file. The file may be corrupted.'));
                reader.readAsText(file);
                return;
            }

            // Handle BMP and ICO files - these formats may need special processing
            if (file.type === 'image/bmp' || file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon') {
                console.log(`Processing ${file.type} file - will force compression to ensure compatibility`);

                // For these formats, always compress to ensure browser compatibility
                compressImage(file)
                    .then(resolve)
                    .catch((error) => {
                        reject(new Error(`Failed to process ${file.type} file: ${error.message}`));
                    });
                return;
            }

            // For bitmap image types, use FileReader first with enhanced error handling
            const reader = new FileReader();

            // Set up timeout for file reading
            const readTimeout = setTimeout(() => {
                reject(new Error('File reading timed out. The file may be too large or corrupted.'));
            }, 15000); // 15 second timeout

            reader.onload = (e) => {
                clearTimeout(readTimeout);

                try {
                    const dataUrl = e.target.result;

                    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
                        reject(new Error('Failed to read image file. The file may be corrupted.'));
                        return;
                    }

                    const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
                    console.log(`Image read: ${file.type}, Size: ${sizeKB}KB`);

                    // Enhanced image validation by attempting to load it
                    const testImg = new Image();
                    const testTimeout = setTimeout(() => {
                        reject(new Error('Image validation timed out. The file may be corrupted or in an unsupported format.'));
                    }, 10000);

                    testImg.onload = () => {
                        clearTimeout(testTimeout);

                        // Validate image dimensions
                        if (testImg.width === 0 || testImg.height === 0) {
                            reject(new Error('Invalid image dimensions. The image appears to be corrupted.'));
                            return;
                        }

                        console.log(`Image validated: ${testImg.width}x${testImg.height}`);

                        // Check if compression is needed
                        if (sizeKB <= 2048) {
                            console.log('Image size acceptable, using original');
                            resolve(dataUrl);
                        } else {
                            console.log('Image too large, compressing...');
                            compressImage(file)
                                .then(resolve)
                                .catch(reject);
                        }
                    };

                    testImg.onerror = () => {
                        clearTimeout(testTimeout);
                        console.error('Image validation failed, attempting compression...');

                        // Try compression as a last resort
                        compressImage(file)
                            .then(resolve)
                            .catch((compressionError) => {
                                reject(new Error(`Image processing failed: ${compressionError.message}`));
                            });
                    };

                    testImg.src = dataUrl;
                } catch (processingError) {
                    clearTimeout(readTimeout);
                    reject(new Error(`Failed to process image: ${processingError.message}`));
                }
            };

            reader.onerror = (error) => {
                clearTimeout(readTimeout);
                console.error('FileReader error:', error);
                reject(new Error('Failed to read image file. The file may be corrupted or in an unsupported format.'));
            };

            try {
                reader.readAsDataURL(file);
            } catch (readerError) {
                clearTimeout(readTimeout);
                reject(new Error('Failed to start reading file. Please try a different image.'));
            }
        });
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
        clearUserSession();
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
            const userAvatar = getUserNavigationAvatar(currentUser);
            userActions.innerHTML = `
                <a href="${profilePageUrl}" class="profile-link">
                    ${userAvatar}
                    <span>Hello, ${currentUser.name}</span>
                </a>
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

    // --- FORM VALIDATION AND ERROR HANDLING ---

    function validateSignupForm(name, email, password, form) {
        let isValid = true;

        // Validate name
        if (!name || name.length < 2) {
            showFormError(form, 'name', 'Name must be at least 2 characters long.');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showFormError(form, 'email', 'Please enter a valid email address.');
            isValid = false;
        }

        // Validate password
        if (!password || password.length < 6) {
            showFormError(form, 'password', 'Password must be at least 6 characters long.');
            isValid = false;
        }

        return isValid;
    }

    function showFormError(form, fieldName, message) {
        // Remove any existing error for this field
        const existingError = form.querySelector(`.error-message[data-field="${fieldName}"]`);
        if (existingError) {
            existingError.remove();
        }

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.setAttribute('data-field', fieldName);
        errorElement.textContent = message;

        if (fieldName === 'general') {
            // Insert at the top of the form
            form.insertBefore(errorElement, form.firstChild);
        } else {
            // Insert after the specific field
            const field = form.querySelector(`#${fieldName}`);
            if (field && field.parentNode) {
                field.parentNode.insertBefore(errorElement, field.nextSibling);
                field.classList.add('error');
            }
        }
    }

    function showFormSuccess(form, message) {
        clearFormErrors(form);
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        form.insertBefore(successElement, form.firstChild);
    }

    function clearFormErrors(form) {
        // Remove all error messages
        const errorMessages = form.querySelectorAll('.error-message, .success-message');
        errorMessages.forEach(msg => msg.remove());

        // Remove error styling from fields
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }

    // --- FORM SUBMISSION HANDLERS ---

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear any previous error messages
            clearFormErrors(signupForm);

            const name = signupForm.querySelector('#name').value.trim();
            const email = signupForm.querySelector('#email').value.trim();
            const password = signupForm.querySelector('#password').value;

            // Validate inputs
            if (!validateSignupForm(name, email, password, signupForm)) {
                return;
            }

            const users = getUsers();
            if (users.some(u => u.email === email)) {
                showFormError(signupForm, 'email', 'This email is already registered.');
                return;
            }

            const newUser = {
                name,
                email,
                password,
                savedArticles: [],
                profileImage: null,
                joinDate: new Date().toISOString()
            };
            users.push(newUser);
            setUsers(users);
            setCurrentUserEmail(email);

            // Show success message before redirect
            showFormSuccess(signupForm, 'Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear any previous error messages
            clearFormErrors(loginForm);

            const email = loginForm.querySelector('#email').value.trim();
            const password = loginForm.querySelector('#password').value;

            // Basic validation
            if (!email || !password) {
                showFormError(loginForm, 'general', 'Please fill in all fields.');
                return;
            }

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                setCurrentUserEmail(email);
                showFormSuccess(loginForm, 'Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                showFormError(loginForm, 'general', 'Invalid email or password.');
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

                // Get comment author's profile image
                const commentAuthorAvatar = getCommentAuthorAvatar(comment.author);

                commentElement.innerHTML = `
                    ${commentAuthorAvatar}
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

        // Update profile information
        updateProfileDisplay(currentUser);

        // Initialize profile image upload functionality
        initializeProfileImageUpload(currentUser);

        // Initialize saved articles section
        initializeSavedArticles(currentUser);
    }

    function updateProfileDisplay(user) {
        // Update profile name
        const profileNameElement = document.getElementById('profile-name');
        if (profileNameElement) {
            profileNameElement.textContent = user.name;
        }

        // Update join date
        const joinDateElement = document.getElementById('profile-join-date');
        if (joinDateElement && user.joinDate) {
            const joinDate = new Date(user.joinDate);
            joinDateElement.textContent = `Joined on ${joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`;
        }

        // Update profile avatar
        updateProfileAvatar(user);
    }

    function updateProfileAvatar(user) {
        const avatarDisplay = document.getElementById('profile-avatar-display');
        const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');
        const avatarInitial = document.getElementById('profile-avatar-initial');

        if (user.profileImage) {
            // Show profile image
            avatarDisplay.src = user.profileImage;
            avatarDisplay.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else {
            // Show placeholder with initial
            avatarDisplay.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
            if (avatarInitial) {
                avatarInitial.textContent = user.name ? user.name.charAt(0).toUpperCase() : '?';
            }
        }
    }

    function initializeProfileImageUpload(user) {
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        const modal = document.getElementById('profile-image-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-upload-btn');
        const fileInput = document.getElementById('profile-image-input');
        const uploadContainer = document.getElementById('profile-image-upload-container');
        const imagePreview = document.getElementById('profile-image-preview');
        const imagePreviewContainer = document.getElementById('profile-image-preview-container');
        const uploadPrompt = uploadContainer.querySelector('.image-upload-prompt');
        const changeImageBtn = document.getElementById('change-image-btn');
        const saveBtn = document.getElementById('save-profile-image-btn');
        const removeBtn = document.getElementById('remove-profile-image-btn');
        const feedback = document.getElementById('upload-feedback');

        let selectedImageData = null;

        // Open modal
        changeAvatarBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            resetUploadState();
        });

        // Close modal
        const closeModal = () => {
            modal.style.display = 'none';
            resetUploadState();
        };

        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Change image button
        if (changeImageBtn) {
            changeImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Change image button clicked');
                fileInput.click();
            });
        }

        // Make preview container clickable for re-selection
        if (imagePreviewContainer) {
            imagePreviewContainer.addEventListener('click', (e) => {
                // Only trigger if clicking on the overlay or the image itself
                if (e.target === imagePreviewContainer || e.target === imagePreview || e.target.closest('.image-preview-overlay')) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Preview container clicked for re-selection');
                    fileInput.click();
                }
            });
        }

        // Prevent modal content clicks from bubbling up
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Close modal when clicking outside (on the backdrop)
        modal.addEventListener('click', (e) => {
            // Only close if clicking directly on the modal backdrop, not on any child elements
            if (e.target === modal) {
                console.log('Modal backdrop clicked, closing modal');
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            e.stopPropagation();
            const file = e.target.files[0];
            if (file) {
                console.log('New file selected:', file.name);
                handleImageFile(file);
            }
        });

        // Drag and drop
        uploadContainer.addEventListener('click', (e) => {
            // Only trigger file input if clicking on the upload prompt area and no image is selected
            if (!selectedImageData && e.target.closest('.image-upload-prompt')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Upload container clicked, opening file picker');
                fileInput.click();
            }
        });

        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.add('drag-over');
        });

        uploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.remove('drag-over');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                console.log('File dropped:', file.name);
                handleImageFile(file);
            }
        });

        // Save profile image
        saveBtn.addEventListener('click', () => {
            if (selectedImageData && user.email) {
                console.log('Saving profile image for user:', user.email);
                const success = updateUserProfileImage(user.email, selectedImageData);
                if (success) {
                    // Update current user object
                    user.profileImage = selectedImageData;

                    // Update all UI components immediately
                    updateAllProfileImages(user);

                    showFeedback('Profile picture updated successfully!', 'success');
                    setTimeout(closeModal, 1500);
                } else {
                    showFeedback('Failed to update profile picture. Please try again.', 'error');
                }
            }
        });

        // Remove profile image
        removeBtn.addEventListener('click', () => {
            if (user.email) {
                console.log('Removing profile image for user:', user.email);
                const success = removeUserProfileImage(user.email);
                if (success) {
                    user.profileImage = null;

                    // Update all UI components immediately
                    updateAllProfileImages(user);

                    showFeedback('Profile picture removed successfully!', 'success');
                    setTimeout(closeModal, 1500);
                } else {
                    showFeedback('Failed to remove profile picture. Please try again.', 'error');
                }
            }
        });

        function handleImageFile(file) {
            // Debug the file first
            const debugInfo = debugImageFile(file);
            showFeedback('Processing image...', 'success');

            // Reset any previous state
            resetUploadState();

            processProfileImage(file)
                .then((dataUrl) => {
                    console.log('Profile image processed successfully, data URL length:', dataUrl.length);
                    selectedImageData = dataUrl;

                    // Update image preview with enhanced error handling
                    if (imagePreview && imagePreviewContainer) {
                        // Set up preview image load handlers
                        const previewLoadTimeout = setTimeout(() => {
                            console.error('Preview image load timeout');
                            showFeedback('Preview failed to load. Please try a different image.', 'error');
                            resetUploadState();
                        }, 5000);

                        imagePreview.onload = () => {
                            clearTimeout(previewLoadTimeout);
                            console.log('Preview image loaded successfully');

                            // Show preview elements
                            imagePreview.classList.remove('image-preview-hidden');
                            imagePreview.style.display = 'block';
                            imagePreviewContainer.style.display = 'block';

                            // Hide upload prompt
                            if (uploadPrompt) {
                                uploadPrompt.style.display = 'none';
                            }

                            // Enable save button
                            if (saveBtn) {
                                saveBtn.disabled = false;
                            }

                            showFeedback('Image ready to save!', 'success');
                        };

                        imagePreview.onerror = () => {
                            clearTimeout(previewLoadTimeout);
                            console.error('Preview image failed to load');
                            showFeedback('Preview failed to display. The image may be corrupted.', 'error');
                            resetUploadState();
                        };

                        // Set the source to trigger loading
                        imagePreview.src = dataUrl;
                    } else {
                        console.error('Image preview elements not found');
                        showFeedback('Preview elements not found. Please refresh the page and try again.', 'error');
                        resetUploadState();
                    }
                })
                .catch((error) => {
                    console.error('Profile image processing error:', error);

                    // Provide more specific error messages based on error content
                    let userMessage = error.message;
                    if (error.message.includes('timeout')) {
                        userMessage = 'Processing timed out. Please try a smaller image or different format.';
                    } else if (error.message.includes('corrupted')) {
                        userMessage = 'The image appears to be corrupted. Please try a different image.';
                    } else if (error.message.includes('dimensions')) {
                        userMessage = 'Image dimensions are invalid. Please try a different image.';
                    } else if (error.message.includes('format')) {
                        userMessage = 'Unsupported image format. Please use WEBP, PNG, JPG, JPEG, GIF, SVG, BMP, or ICO.';
                    } else if (error.message.includes('size')) {
                        userMessage = 'Image file is too large. Please use an image smaller than 2MB.';
                    }

                    showFeedback(userMessage, 'error');
                    resetUploadState();
                });
        }

        function resetUploadState() {
            console.log('Resetting upload state');
            selectedImageData = null;

            if (fileInput) {
                fileInput.value = '';
            }

            if (imagePreview) {
                // Clear any existing event handlers
                imagePreview.onload = null;
                imagePreview.onerror = null;

                imagePreview.classList.add('image-preview-hidden');
                imagePreview.style.display = 'none';

                // Use a placeholder image instead of '#' to avoid broken image icon
                imagePreview.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+';
            }

            if (imagePreviewContainer) {
                imagePreviewContainer.style.display = 'none';
            }

            if (uploadPrompt) {
                uploadPrompt.style.display = 'block';
            }

            if (saveBtn) {
                saveBtn.disabled = true;
            }

            if (feedback) {
                feedback.style.display = 'none';
                feedback.textContent = '';
                feedback.className = 'upload-feedback';
            }
        }

        function showFeedback(message, type) {
            feedback.textContent = message;
            feedback.className = `upload-feedback ${type}`;
            feedback.style.display = 'block';
        }
    }

    function getCommentAuthorAvatar(authorName) {
        if (!authorName) {
            return '<div class="comment-avatar">?</div>';
        }

        // Find user by name to get their profile image
        const users = getUsers();
        const author = users.find(u => u.name === authorName);
        const authorInitial = authorName.charAt(0).toUpperCase();

        if (author && author.profileImage) {
            return `<img src="${author.profileImage}" alt="${authorName} Avatar" class="comment-avatar" style="object-fit: cover;">`;
        } else {
            return `<div class="comment-avatar">${authorInitial}</div>`;
        }
    }

    function getUserNavigationAvatar(user) {
        if (!user) return '';

        const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

        if (user.profileImage) {
            return `<img src="${user.profileImage}" alt="${user.name} Avatar" class="nav-avatar" style="object-fit: cover;">`;
        } else {
            return `<div class="nav-avatar-placeholder">${initial}</div>`;
        }
    }

    function updateAllProfileImages(user) {
        console.log('Updating all profile images for user:', user.name);

        // Update profile page avatar
        updateProfileAvatar(user);

        // Update navigation bar
        updateNavBasedOnLoginState();

        // Update any existing comments on the current page
        updateCommentsAvatars(user);

        console.log('All profile images updated successfully');
    }

    function updateCommentsAvatars(user) {
        // Find all comment avatars for this user and update them
        const commentItems = document.querySelectorAll('.comment-item');
        commentItems.forEach(commentItem => {
            const authorElement = commentItem.querySelector('.comment-author');
            if (authorElement && authorElement.textContent.trim() === user.name) {
                const avatarElement = commentItem.querySelector('.comment-avatar');
                if (avatarElement) {
                    if (user.profileImage) {
                        // Replace with image
                        avatarElement.outerHTML = `<img src="${user.profileImage}" alt="${user.name} Avatar" class="comment-avatar" style="object-fit: cover;">`;
                    } else {
                        // Replace with initial
                        const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
                        avatarElement.outerHTML = `<div class="comment-avatar">${initial}</div>`;
                    }
                }
            }
        });
    }

    function initializeSavedArticles(currentUser) {
        const savedArticlesContainer = document.getElementById('saved-articles-section');
        if (savedArticlesContainer && currentUser) {
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
        // Restore user session if available
        restoreUserSession();

        handleTheme();
        updateNavBasedOnLoginState();
        handleSaveActions();

        // Debug logging for authentication state
        const currentUser = getCurrentUser();
        console.log('Current user on page load:', currentUser ? currentUser.name : 'Not logged in');
        console.log('Current page:', window.location.pathname);

        // Update session activity periodically
        setInterval(updateSessionActivity, 5 * 60 * 1000); // Every 5 minutes
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