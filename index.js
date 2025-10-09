import { getPosts, addPost } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import { renderUserPostsPageComponent } from "./components/user-posts-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";


export let user = getUserFromLocalStorage();
console.log("Текущий пользователь:", user);
export let page = null;
export let posts = [];
export let currentPageData = null;

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};


export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          page = POSTS_PAGE;
          posts = [];
          renderApp();
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      if (!data || !data.userId) {
        console.error(
          "Не передан ID пользователя для страницы USER_POSTS_PAGE"
        );
        return goToPage(POSTS_PAGE);
      }

      page = LOADING_PAGE;
      currentPageData = data;
      renderApp();

      return getPosts({ token: getToken() })
        .then((allPosts) => {
          page = USER_POSTS_PAGE;
          // 🔸 Сравниваем ID как строки, чтобы избежать проблем с типами
          posts = allPosts.filter(post => String(post.user.id) === String(data.userId));
          renderApp();
        })
        .catch((error) => {
          console.error(
            "Ошибка при загрузке постов для страницы пользователя:",
            error
          );
          goToPage(POSTS_PAGE);
        });
    }

    page = newPage;
    renderApp();
    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        page = LOADING_PAGE;
        renderApp();

        addPost({
          token: getToken(),
          description,
          imageUrl,
        })
          .then((newPost) => {
            console.log("Пост добавлен", newPost);
            posts.unshift(newPost);
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error("Ошибка при добавлении поста:", error);
            alert("Не удалось добавить пост: " + error.message);
            goToPage(ADD_POSTS_PAGE);
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
      token: getToken()
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderUserPostsPageComponent({
      appEl,
      posts: posts,
      goToPage,
      currentUser: user,
    });
  }
};

goToPage(POSTS_PAGE);