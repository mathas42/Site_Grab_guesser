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

function addCheckboxCell(row, name, label, id) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.setAttribute("form", id);
    checkbox.setAttribute("aria-label", label);
    row.insertCell().append(checkbox);
    return checkbox;
}

function addNicknameCell(row, user, id) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "nickname";
    input.value = user.nickname;
    input.maxLength = 30;
    input.required = true;
    input.setAttribute("form", id);
    input.setAttribute("aria-label", `Change nickname of ${user.nickname}`);
    row.insertCell().append(input);
}

function addRoleCell(row, user, id) {
    const select = document.createElement("select");
    select.className = "role-select";
    select.name = "role";
    select.setAttribute("form", id);
    select.setAttribute("aria-label", `Change role of ${user.nickname}`);

    select.add(new Option("Player", "Player"));
    select.add(new Option("Admin", "Admin"));
    select.value = user.user_role;

    row.insertCell().append(select);
}

async function submitUser(id, data) {
    // Une case décochée n'apparaît pas dans FormData
    const options = data.has("delete")
        ? { method: "DELETE" }
        : {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: data.get("role"), nickname: data.get("nickname") }),
          };

    const res = await fetch(`/admin/users/${id}`, options);
    const result = await res.json();

    getNotification(res.ok ? "Success" : "Error", result.message);

    if (res.ok) {
        loadUsers(searchInput.value.trim());
    }
}

function displayUsers(users) {
    usersBody.replaceChildren();

    users.forEach((user) => {
        const row = usersBody.insertRow();
        const date = new Date(user.creation_date).toLocaleDateString();
        const formId = `user-form-${user.id}`;

        const modify = addCheckboxCell(row, "modify", `Modify ${user.nickname}`, formId);

        [user.id, user.user_role, user.nickname, user.email, date].forEach((value) => {
            row.insertCell().textContent = value;
        });

        addRoleCell(row, user, formId);
        addNicknameCell(row, user, formId);
        addCheckboxCell(row, "delete", `Delete ${user.nickname}`, formId);

        const confirm = addCheckboxCell(row, "confirm", `Confirm changes for ${user.nickname}`, formId);
        confirm.required = true; // le navigateur bloque l'envoi si la case n'est pas cochée

        const form = document.createElement("form");
        form.id = formId;

        const button = document.createElement("button");
        button.textContent = "Save";
        form.append(button);
        confirm.parentElement.append(form);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitUser(user.id, new FormData(form));
        });

        // Tout est grisé sur la ligne tant que Modify n'est pas cochée
        const toggleFields = () => {
            row.querySelectorAll("input:not([name='modify']), select, button").forEach((field) => {
                field.disabled = !modify.checked;
            });
        };

        modify.addEventListener("change", toggleFields);
        toggleFields();
    });
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadUsers(searchInput.value.trim());
});

loadUsers();


const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("myFile");

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (fileInput.files.length === 0) {
        getNotification("Upload", "Select an image.", "error");
        return;
    }

    const data = new FormData(uploadForm);
    const category = uploadForm.dataset.category;      

    try {
        const res = await fetch("/admin/upload/" + category, { method: "POST", body: data });
        const result = await res.json();

        getNotification(res.ok ? "Success" : "Error", result.message, res.ok ? "success" : "error");

        if (res.ok) {
            uploadForm.reset();
        }
    } catch (error) {
        console.error(error);
        getNotification("Error", "Network error.", "error");
    }
});