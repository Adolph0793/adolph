document.addEventListener('DOMContentLoaded', function() {
    const postButton = document.getElementById('post-status');
    const statusInput = document.getElementById('status');
    const newsFeed = document.querySelector('.news-feed');

    // Fonction pour créer un post
    function createPost(username, text, avatarUrl) {
        const post = document.createElement('div');
        post.classList.add('post');
        post.innerHTML = `
            <div class="post-header">
                <img src="${avatarUrl}" alt="User Avatar">
                <strong>${username}</strong>
            </div>
            <p>${text}</p>
            <div class="post-actions">
                <button class="like-btn">Like <span class="like-count">0</span></button>
                <button class="comment-btn">Comment <span class="comment-count">0</span></button>
                <button class="share-btn">Share</button>
            </div>
        `;

        // Gestion du Like
        const likeBtn = post.querySelector('.like-btn');
        const likeCount = post.querySelector('.like-count');
        likeBtn.addEventListener('click', () => {
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        });

        // Gestion du Comment
        const commentBtn = post.querySelector('.comment-btn');
        const commentCount = post.querySelector('.comment-count');
        commentBtn.addEventListener('click', () => {
            const comment = prompt("Enter your comment:");
            if (comment) {
                commentCount.textContent = parseInt(commentCount.textContent) + 1;
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('post-comment');
                commentDiv.innerHTML = `<strong>You:</strong> ${comment}`;
                post.appendChild(commentDiv);
            }
        });

        newsFeed.prepend(post);
    }

    // Bouton publier
    postButton.addEventListener('click', function() {
        const statusText = statusInput.value.trim();
        if (statusText) {
            createPost("You", statusText, "https://via.placeholder.com/40");
            statusInput.value = '';
        } else {
            alert('Please enter a status before posting.');
        }
    });

    // Exemple de posts initiaux
    createPost("User1", "This is a sample post!", "https://via.placeholder.com/40/0077ff/ffffff");
    createPost("User2", "Another sample post!", "https://via.placeholder.com/40/ff5500/ffffff");
});
