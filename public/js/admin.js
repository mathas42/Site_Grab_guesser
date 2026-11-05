const searchForm = document.getElementById("search");
const searchInput = document.getElementById("search-input");
const usersBody = document.getElementById("users");

async function loadUsers(search = "") {
    const res = await fetch(`/admin/users?search=${encodeURIComponent(search)}`);

    if (!res.ok) {
        console.error("Error loading users:", res.status);
        return;
    }

    displayUsers(await res.json());
}

function displayUsers(users) {
    usersBody.replaceChildren();

    users.forEach((user) => {
        const row = usersBody.insertRow();
        const date = new Date(user.creation_date).toLocaleDateString();

        [user.id, user.user_role, user.nickname, user.email, date].forEach((value) => {
            row.insertCell().textContent = value;
        });
    });
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadUsers(searchInput.value.trim());
});

loadUsers();
