let notificationTimer = null;
const NOTE_EXTRA = 120;   


function textWidth(element) {
    const canvas = textWidth.canvas || (textWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    const style = getComputedStyle(element);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return ctx.measureText(element.textContent).width;
}

function getNotification(name, text, type = "success") {
    const notification = document.querySelector(".notification");
    if (!notification) return;

    const nameEl = notification.querySelector(".name");
    const messageEl = notification.querySelector(".message");
    if (name) nameEl.textContent = name;
    if (text) messageEl.textContent = text;
    notification.classList.toggle("error", type === "error");

    notification.classList.remove("active", "hidden");


    const natural = Math.ceil(Math.max(textWidth(nameEl), textWidth(messageEl))) + NOTE_EXTRA;
    const width = Math.min(natural, window.innerWidth * 0.92);
    notification.style.setProperty("--note-w", width + "px");

    void notification.offsetWidth; 
    clearTimeout(notificationTimer);
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
