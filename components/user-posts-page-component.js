// components/user-posts-page-component.js
import { renderHeaderComponent } from "./header-component.js";
import { formatDistanceToNow } from "../helpers.js";
import { USER_POSTS_PAGE } from "../routes.js";

export function renderUserPostsPageComponent({ appEl, posts, goToPage, currentUser }) {
  let pageTitle = "Посты пользователя";
  if (posts.length > 0) {
    const owner = posts[0].user;
    const isMyProfile = currentUser && String(currentUser._id) === String(owner.id);
    pageTitle = isMyProfile ? "Мои посты" : `Посты: ${owner.name}`;
  }

  const postsHtml = posts.map(post => {
    const isLiked = post.isLiked ? "like-active.svg" : "like-not-active.svg";
    const likesCount = Array.isArray(post.likes) 
      ? post.likes.length 
      : (typeof post.likes === 'number' ? post.likes : 0);
    const formattedDate = formatDistanceToNow(post.createdAt);

    return `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
          <img src="${post.user.imageUrl}" class="post-header__user-image">
          <p class="post-header__user-name">${post.user.name}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}">
        </div>
        <div class="post-likes">
          <button data-post-id="${post.id}" class="like-button">
            <img src="./assets/images/${isLiked}">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${likesCount}</strong>
          </p>
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

  const noPostsHtml = posts.length === 0 
    ? '<p class="no-posts">У пользователя пока нет постов.</p>' 
    : '';

  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <h2 class="user-page-title">${pageTitle}</h2>
      <ul class="posts">
        ${postsHtml}
        ${noPostsHtml}
      </ul>
    </div>
  `;

  renderHeaderComponent({
    element: appEl.querySelector(".header-container"),
  });

  for (const userEl of appEl.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}