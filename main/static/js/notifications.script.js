if (authToken) {
	getNotifications();
}

function getNotifications() {
	fetch("/api/v1/main/get_notifications", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
		.then(response => response.json())
		.then(data => {
			insertNotifications(data);
			eventListenerNotificationsBtns();
		})
		.catch(error => console.log(error));
}

function insertNotifications(data) {
	const notifications = document.querySelector(".notifications");
	const notificationsCounter = notifications.querySelector(
		".notifications__counter"
	);
	const notificationsList = notifications.querySelector(".menu__list");
	if (Number(data.count) <= 0) {
		document.querySelector("#deleteNotifications").remove();
		notificationsList.innerHTML = "<p>Уведомлений нет</p>";
		notificationsCounter.style = "display: none";
	} else {
		notificationsList.innerHTML = "";
		data.notifications.forEach(notification => {
			let date = new Date(Date.parse(notification.created_at));
			let options = {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				// timeZone: "Europe/Moscow",
			};
			let formattedTime = new Intl.DateTimeFormat("ru-RU", options).format(
				date
			);
			console.log(notification);
			if (
				notification.message.includes("хочет присоединиться к вашей поездке")
			) {
				notificationsList.innerHTML += `
				<div class="menu__item">
					<span>${notification.message}</span>
					<button class="notification-action" data-notification-id="${notification.id}" data-action="accept">Принять</button>
					<button class="notification-action" data-notification-id="${notification.id}" data-action="decline">Отклонить</button>
					<div class="menu__item-footer">
						<div class="menu__item-date">${formattedTime}</div>
					</div>
				</div>`;
			} else {
				notificationsList.innerHTML += `
				<div class="menu__item">
					<span>${notification.message}</span>
					<div class="menu__item-footer">
						<div class="menu__item-date">${formattedTime}</div>
						<div class="menu__item-delete" id="deleteNotification" data-id="${notification.id}">Удалить</div>
					</div>
				</div>`;
			}
		});
		notificationsCounter.textContent = data.count;
	}
}

function deleteNotification(notification_id = null) {
	let link;
	if (notification_id) {
		link = `/api/v1/main/delete_notification?notification_id=${notification_id}`;
	} else {
		link = `/api/v1/main/delete_notification`;
	}
	fetch(link, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
		.then(response => response.json())
		.then(data => console.log(data))
		.catch(error => console.error(error));
}
