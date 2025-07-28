const postsData = { // posts data
    "a-journey-through-time": {
        "id": "a-journey-through-time",
        "title": "A Journey Through Time: The World's Most Beautiful Libraries",
        "author": "Alice Johnson",
        "date": "12 Jan 2025",
        "category": "Culture",
        "image": "images/pexels-benni-fish-40038242-12418421.jpg",
        "content": "<p>Travel through the hallowed halls of history and explore the world's most breathtaking libraries. From the ancient scrolls of Alexandria to the modern architectural marvels of today, we uncover the stories behind these temples of knowledge.</p><h2>The Great Library of Alexandria</h2><p>Once the largest library in the world, the Great Library of Alexandria was a beacon of scholarship in antiquity. It housed countless scrolls and attracted the greatest minds of the Hellenistic world. Though lost to history, its legacy continues to inspire.</p><h2>Trinity College Library, Dublin</h2><p>Home to the Book of Kells, the Long Room at Trinity College Library is a bucket-list destination for any book lover. Its towering, oak-paneled shelves and barrel-vaulted ceiling create an atmosphere of scholarly reverence that is simply unforgettable.</p>"
    }, // a journey through time    
    "the-art-of-slow-travel": {
        "id": "the-art-of-slow-travel",
        "title": "The Art of Slow Travel: A Guide to Mindful Exploration",
        "author": "Bob Smith",
        "date": "18 Jan 2025",
        "category": "Travel",
        "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>In a world that's always rushing, slow travel offers a chance to connect more deeply with the places you visit. It's about savoring moments, engaging with local cultures, and creating meaningful memories that last a lifetime.</p><h2>Embrace Serendipity</h2><p>One of the core tenets of slow travel is to leave room for the unexpected. Ditch the packed itinerary and allow yourself to wander. You might discover a hidden cafe, a charming local market, or a stunning viewpoint you would have otherwise missed.</p>"
    }, // the art of slow travel
    "hidden-culinary-gems": {
        "id": "hidden-culinary-gems",
        "title": "Hidden Culinary Gems: Finding the Best Local Eats",
        "author": "Charlie Brown",
        "date": "22 Jan 2025",
        "category": "Food",
        "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>To truly experience a destination, you must taste its food. This guide will help you venture off the beaten path to find authentic, local culinary experiences that will delight your palate and enrich your travels.</p>"
    }, // hidden culinary gems
    "urban-exploration": {
        "id": "urban-exploration",
        "title": "Urban Exploration: Finding Adventure in the City",
        "author": "Diana Prince",
        "date": "25 Jan 2025",
        "category": "Adventure",
        "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>Adventure isn't just found in remote jungles or on towering peaks. The world's cities are vibrant playgrounds for the modern explorer. Discover abandoned subway stations, hidden rooftop gardens, and the thriving street art scenes that bring urban landscapes to life.</p>"
    }, // urban exploration
    "sustainable-travel": {
        "id": "sustainable-travel",
        "title": "Sustainable Travel: How to Be a Responsible Tourist",
        "author": "Eleanor Shellstrop",
        "date": "30 Jan 2025",
        "category": "Lifestyle",
        "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>Traveling comes with a responsibility to protect the beautiful planet we call home. Learn how to minimize your environmental impact, support local communities, and make ethical choices that ensure destinations remain vibrant for generations to come.</p>"
    }, // sustainable travel
    "a-digital-nomads-guide": {
        "id": "a-digital-nomads-guide",
        "title": "A Digital Nomad's Guide to Working from Anywhere",
        "author": "Frank Underwood",
        "date": "02 Feb 2025",
        "category": "Technology",
        "image": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>The dream of working from a tropical beach or a bustling European capital is more attainable than ever. This guide covers the essentials of the digital nomad lifestyle, from finding reliable Wi-Fi to managing time zones and staying productive on the road.</p>"
    }, // digital nomad's guide
    "travel-photography-tips": {
        "id": "travel-photography-tips",
        "title": "Essential Photography Tips for Travelers",
        "author": "Grace Lee",
        "date": "10 Feb 2025",
        "category": "Tips & Hacks",
        "image": "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>Capture your travel memories like a pro. This guide covers everything from composition basics to advanced techniques for shooting in various lighting conditions. Learn how to tell a story with your photos.</p>"
    },
    "packing-hacks-for-minimalists": {
        "id": "packing-hacks-for-minimalists",
        "title": "Packing Hacks for the Modern Minimalist",
        "author": "Henry Jones Jr.",
        "date": "15 Feb 2025",
        "category": "Tips & Hacks",
        "image": "https://images.unsplash.com/photo-1588862894367-ed21b6d17349?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>Travel lighter and smarter with these minimalist packing hacks. We'll show you how to choose versatile clothing, maximize suitcase space, and avoid unnecessary items, leaving more room for what truly matters.</p>"
    },
    "solo-travel-safety": {
        "id": "solo-travel-safety",
        "title": "The Ultimate Guide to Safe Solo Travel",
        "author": "Ivy Chen",
        "date": "20 Feb 2025",
        "category": "Lifestyle",
        "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "content": "<p>Embarking on a solo adventure is a liberating experience. This guide provides essential safety tips for solo travelers, from choosing accommodations to navigating new cities with confidence.</p>"
    }
}; 