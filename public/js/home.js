// This file manages the functionality of the home page, including posting statuses and displaying a fake news feed.

document.addEventListener('DOMContentLoaded', function() {
    const postButton = document.getElementById('postButton');
    const statusInput = document.getElementById('statusInput');
    const newsFeed = document.getElementById('newsFeed');

    postButton.addEventListener('click', function() {
        const statusText = statusInput.value.trim();
        if (statusText) {
            const newPost = document.createElement('div');
            newPost.classList.add('post');
            newPost.textContent = statusText;
            newsFeed.prepend(newPost);
            statusInput.value = ''; // Clear the input after posting
        } else {
            alert('Please enter a status before posting.');
        }
    });
});