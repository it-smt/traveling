const tripSelectBtn = document.querySelector("#tripSelectBtn");

if (tripSelectBtn) {
	tripSelectBtn.addEventListener("click", () => {
		fetch(`/api/v1/main/add_passenger?trip_id=${tripSelectBtn.dataset.id}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authToken.value}`,
			},
		})
			.then(response => response.json())
			.then(data => {
				console.log(data);
			})
			.catch(error => console.log(error));
	});
}
