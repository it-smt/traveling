const authToken = document.querySelector("#authToken").value;

if (authToken) {
	getNotifications();
}

function getNotifications() {
	fetch("/api/v1/main/get_notifications", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${authToken}`,
		},
	})
		.then(response => response.json())
		.then(data => {
			insertNotifications(data);
		})
		.catch(error => console.log(error));
}

function insertNotifications(data) {
	const notifications = document.querySelector(".notifications");
	const notificationsCounter = notifications.querySelector(
		".notifications__counter"
	);
	const notificationsList = notifications.querySelector(".menu__list");
	notificationsCounter.textContent = data.count;
	if (Number(data.count) <= 0) {
		notificationsList.innerHTML = "<p>Уведомлений нет</p>";
	} else {
		notificationsList.innerHTML = "";
		data.notifications.forEach(notification => {
			notificationsList.innerHTML += `<div class="menu__item">${notification.message}</div>`;
		});
	}
}
