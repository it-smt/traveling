const notificationsMenu = document.querySelector("#notificationsMenu");
const notificationsMenuBtn = document.querySelector("#notificationsMenuButton");
const overlay = document.querySelector("#overlay");

notificationsMenuBtn.addEventListener("click", () => {
	notificationsMenu.classList.toggle("_active");
});

overlay.addEventListener("click", () => {
	notificationsMenu.classList.remove("_active");
});
