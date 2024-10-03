const switchItems = document.querySelectorAll("#switchItem");
const travelsCards = document.querySelector("#travelsCards");
// const authToken = document.querySelector("#authToken").value;

switchItems.forEach(item => {
	if (item.classList.contains("_active")) {
		getTrips(item);
	}
});

switchItems.forEach(item => {
	item.addEventListener("click", () => {
		switchItems.forEach(item => {
			item.classList.remove("_active");
			item.style = "pointer-events: all;";
		});
		item.classList.add("_active");
		item.style = "pointer-events: none;";
		getTrips(item);
	});
});

function getTrips(item) {
	let option;
	if (item.textContent == "Я еду") {
		option = "im_going";
	} else {
		option = "taking_me";
	}
	fetch(`/api/v1/main/get_trips?option=${option}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
		.then(response => response.json())
		.then(data => insertCards(data, option))
		.catch(error => console.log(error));
}

const photoInputLabel = document.querySelector("#photoInputLabel");
const photoInput = document.querySelector("#photoInput");
photoInput.addEventListener("change", () => {
	if (photoInput.files.length > 0) {
		const file = photoInput.files[0];
		const fileCut = file.name.split(".");
		if (["png", "jpeg", "jpg"].includes(fileCut[fileCut.length - 1])) {
			let body = new FormData();
			body.append("avatar", file);
			fetch("/api/v1/main/change_user_data", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken.value}`,
				},
				body: body,
			})
				.then(response => response.json())
				.then(data => {
					console.log(data);
					window.location.reload();
				})
				.catch(error => alert(error));
		} else {
			alert("Неверный формат файла (доступные форматы: png, jpeg, jpg)");
		}
	}
});
