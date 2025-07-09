document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.categories button');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');
        });
    });
});