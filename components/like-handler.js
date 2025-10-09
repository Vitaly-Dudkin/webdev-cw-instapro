import { addLike, removeLike } from "../api.js";

/**
 * Обновляет UI лайка (изображение + счётчик)
 */
const updateLikeUI = (likeButton, isLiked, likesCount) => {
  const imgEl = likeButton.querySelector("img");
  imgEl.src = isLiked
    ? "./assets/images/like-active.svg"
    : "./assets/images/like-not-active.svg";

  const likesTextEl = likeButton.nextElementSibling;
  if (likesTextEl?.classList.contains("post-likes-text")) {
    likesTextEl.innerHTML = `Нравится: <strong>${likesCount}</strong>`;
  }
};

/**
 * Обрабатывает клик по лайку
 */
export const handleLikeClick = ({ postId, likeButton, token, onLikeUpdate }) => {
  const imgEl = likeButton.querySelector("img");
  const isCurrentlyLiked = imgEl.src.includes("like-active.svg");

  // Оптимистичное обновление UI
  const newLikedState = !isCurrentlyLiked;
  const tempLikesCount = isCurrentlyLiked 
    ? (parseInt(likeButton.nextElementSibling?.querySelector("strong")?.textContent || "0") - 1)
    : (parseInt(likeButton.nextElementSibling?.querySelector("strong")?.textContent || "0") + 1);

  updateLikeUI(likeButton, newLikedState, tempLikesCount);

  // Выбор функции API
  const apiCall = newLikedState ? addLike : removeLike;

  apiCall({ postId, token })
    .then((updatedPost) => {
      // Обновляем UI точными данными от сервера
      const actualLikesCount = Array.isArray(updatedPost.likes) 
        ? updatedPost.likes.length 
        : 0;
      updateLikeUI(likeButton, updatedPost.isLiked, actualLikesCount);

      // Обновляем глобальное состояние (если нужно)
      if (onLikeUpdate) {
        onLikeUpdate(updatedPost);
      }
    })
    .catch((error) => {
      console.error("Ошибка при обновлении лайка:", error);
      // Откатываем UI при ошибке
      const originalLikesCount = isCurrentlyLiked 
        ? (parseInt(likeButton.nextElementSibling?.querySelector("strong")?.textContent || "0") + 1)
        : (parseInt(likeButton.nextElementSibling?.querySelector("strong")?.textContent || "0") - 1);
      updateLikeUI(likeButton, isCurrentlyLiked, originalLikesCount);
      alert("Не удалось обновить лайк. Проверьте подключение.");
    });
};