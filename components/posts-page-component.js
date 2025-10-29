import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, deletePostById, posts } from "../index.js";
import { deletePost } from "../api.js";
import { formatDistanceToNow } from "../helpers.js";
import { handleLikeClick } from "./like-handler.js";



export function renderPostsPageComponent({ appEl, token, currentUser }) { 
  const formatLikesCount = (post) => {
    return Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0);
  };

  const postsHtml = posts.map(post => {
    const isLiked = post.isLiked ? "like-active.svg" : "like-not-active.svg";
    const likesCount = formatLikesCount(post);
    const formattedDate = formatDistanceToNow(post.createdAt);
    const isMyPost = currentUser && String(currentUser._id) === String(post.user.id);
    const deleteButtonHtml = isMyPost 
      ? `<button class="delete-button" data-post-id="${post.id}">Удалить</button>`
      : "";
    
      return `
  <li class="post">
    <div class="post-header" data-user-id="${post.user.id}">
      <img src="${post.user.imageUrl}" class="post-header__user-image">
      <p class="post-header__user-name">${post.user.name}</p>
    </div>

    <div class="post-image-container">
      <img class="post-image" src="${post.imageUrl}">
    </div>

    <div class="post-actions">
      <div class="post-likes">
        <button data-post-id="${post.id}" class="like-button">
          <img src="./assets/images/${isLiked}">
        </button>
        <p class="post-likes-text">
          Нравится: <strong>${likesCount}</strong>
        </p>
      </div>
      ${deleteButtonHtml}
    </div>

    <p class="post-text">
      <span class="user-name">${post.user.name}</span>
      ${post.description}
    </p>
    <p class="post-date">
      ${formattedDate}
    </p>
  </li>
    `;
  }).join('');

  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  renderHeaderComponent({
    element: appEl.querySelector(".header-container"),
  });

  // Обработчики аватаров
  for (const userEl of appEl.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  // 🔸 Обработчики лайков
  for (const likeButton of appEl.querySelectorAll(".like-button")) {
    const postId = likeButton.dataset.postId;
    likeButton.addEventListener("click", () => {
      handleLikeClick({
        postId,
        likeButton,
        token,
        onLikeUpdate: (updatedPost) => {
          // Обновляем глобальный массив posts
          const index = posts.findIndex(p => p.id === updatedPost.id);
          if (index !== -1) {
            posts[index] = updatedPost;
          }
        }
      });
    });
  }
    for (const deleteBtn of appEl.querySelectorAll(".delete-button")) {
      const postId = deleteBtn.dataset.postId;
      deleteBtn.addEventListener("click", () => {
        if (!confirm("Вы уверены, что хотите удалить пост?")) return;
    
        deletePost({ postId, token })
          .then(() => {
            deletePostById(postId); // ← вызываем из index.js
          })
          .catch((error) => {
            console.error("Ошибка удаления:", error);
            alert("Не удалось удалить пост: " + error.message);
          });
      });
    }
}