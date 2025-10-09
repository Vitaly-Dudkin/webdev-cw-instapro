export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage(user) {
  try {
    return JSON.parse(window.localStorage.getItem("user"));
  } catch (error) {
    return null;
  }
}

export function removeUserFromLocalStorage(user) {
  window.localStorage.removeItem("user");
}


/**
 * Форматирует дату в человекочитаемый вид: "X минут/часов/дней назад"
 * @param {string|Date} timestamp - дата в формате ISO строки или объект Date
 * @returns {string}
 */
export const formatDistanceToNow = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

  const getPlural = (number, titles) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : cases[number % 10 < 5 ? number % 10 : 5]
    ];
  };

  let interval;

  interval = seconds / 31536000; // секунд в году
  if (interval >= 1) {
    const years = Math.floor(interval);
    return `${years} ${getPlural(years, ['год', 'года', 'лет'])} назад`;
  }

  interval = seconds / 2592000; // секунд в месяце (приблизительно)
  if (interval >= 1) {
    const months = Math.floor(interval);
    return `${months} ${getPlural(months, ['месяц', 'месяца', 'месяцев'])} назад`;
  }

  interval = seconds / 86400; // секунд в дне
  if (interval >= 1) {
    const days = Math.floor(interval);
    return `${days} ${getPlural(days, ['день', 'дня', 'дней'])} назад`;
  }

  interval = seconds / 3600; // секунд в часе
  if (interval >= 1) {
    const hours = Math.floor(interval);
    return `${hours} ${getPlural(hours, ['час', 'часа', 'часов'])} назад`;
  }

  interval = seconds / 60; // секунд в минуте
  if (interval >= 1) {
    const minutes = Math.floor(interval);
    return `${minutes} ${getPlural(minutes, ['минута', 'минуты', 'минут'])} назад`;
  }

  return "только что";
};