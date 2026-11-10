const { json } = require("express");

let notificationTimer = null;
function getNotification(name, text) {
    const notification = document.querySelector(".notification");
    if (!notification) return;
    if (name) notification.querySelector(".name").textContent = name;
    if (text) notification.querySelector(".message").textContent = text;
    clearTimeout(notificationTimer);
    notification.classList.remove("hidden");
    notification.classList.add("active");
    notificationTimer = setTimeout(closeNotification, 3000);
}

function closeNotification() {
    const notification = document.querySelector(".notification");
    if (!notification) return;
    clearTimeout(notificationTimer);
    notification.classList.remove("active");
    notification.classList.add("hidden");
}

const params = new URLSearchParams(window.location.search);
if (params.get("profile") === "updated") {
    getNotification("Profile updated", "Your profile has been saved.");
    history.replaceState(null, "", window.location.pathname);
}
