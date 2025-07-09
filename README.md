# Blog Page Development Journey

This document chronicles the development process of a modern, responsive blog page. It details the steps taken, challenges faced, and solutions implemented from the initial file structure to the final design refinements.

## 1. Project Setup

The project began by establishing a clean and organized file structure:

```
/
├── css/
│   └── style.css
├── javascript/
│   └── script.js
├── pages/
│   ├── Login.html
│   ├── signup.html
│   ├── hotel.html
│   ├── ... (and other pages)
└── index.html
```

-   `index.html`: The main HTML file for the blog's structure.
-   `css/style.css`: The stylesheet for all visual styling.
-   `javascript/script.js`: For interactive elements.
-   `pages/`: Contains all secondary pages for the website.

## 2. Initial Build and Page Linking

The initial version of `index.html` was built with a comprehensive structure. A key step was to link all secondary pages from the `/pages` directory to the main `index.html` file. This included:
-   Connecting the `Log In` and `Sign Up` buttons to `pages/Login.html` and `pages/signup.html`.
-   Updating the main navigation links (Hotel, Flight, Train, etc.) to point to their corresponding pages.

The initial version of `index.html` was built with a comprehensive structure, including:
-   A header with navigation, search bar, and login/signup buttons.
-   A prominent hero section.
-   A main blog section with category filters, a post grid, and pagination.
-   A Call-to-Action (CTA) section.
-   A detailed footer.
## 3. Major Design Refinement via Image-Based Comparison
A significant design overhaul was undertaken to match a specific visual reference. This involved a detailed comparison between the live page and the target image, leading to several iterative changes:

Sample blog posts were included to populate the grid for 
styling purposes.

### CSS Styling
-   **Header Logo:** A globe icon was added to the "Horizone" logo in both the header and footer to match the design.
-   **Hero Section:** Three small indicator dots were added below the main content for visual flair.
-   **Blog Post Cards:**
    -   **Metadata:** Publication date and read time were added to each blog post card.
    -   **Author Avatars:** CSS was adjusted to ensure author images were perfectly circular (`border-radius: 50%`) and correctly sized, preventing distortion.
-   **CTA Section:** The Call-to-Action section was completely restructured into a four-panel grid layout, with custom styling for each panel to match the visual complexity of the reference.
-   **Footer Social Icons:** The social media icons were restyled to be enclosed in circles, matching the design.

## 4. Image Content Alignment

A key challenge was ensuring the placeholder content matched the visual intent of the design.

**Problem:** Some blog post images, despite being styled correctly, looked "out of place" because their composition or aspect ratio did not fit the layout as well as the images in the reference design.

**Solution:** The placeholder images for several blog posts, including "Journey Through Time" and "10 Essential Packing Hacks for Stress-Free Travel," were manually replaced with new images from Unsplash. The new images were selected based on their thematic relevance and, more importantly, their visual composition, which resulted in a more harmonious and professional-looking blog grid.

## 5. Final Outcome

The result is a polished, visually appealing, and responsive blog page that closely matches the target design. The development process involved a combination of initial setup, comprehensive page linking, iterative design refinement based on visual feedback, and careful content curation to achieve the final look.

https://jacobpillai.github.io/Blog/ - Live Demo

photo links:
Photo by Lisa from Pexels: https://www.pexels.com/photo/eyeglasses-beside-bowl-of-food-and-magazine-on-table-1438190/ 
Photo by Benni Fish: https://www.pexels.com/photo/display-rack-with-newspapers-on-street-12418421/
Photo by Michael D Beckwith: https://www.pexels.com/photo/elegant-historical-library-interior-in-scotland-31488463/
