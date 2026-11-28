document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", function () {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", !isExpanded);
        navigation.classList.toggle("is-open", !isExpanded);
    });
}

document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

document.querySelector("#timestamp").value = new Date().toISOString();

document.querySelectorAll("[data-dialog]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const dialog = document.querySelector(`#${link.dataset.dialog}`);
        if (dialog) {
            dialog.showModal();
        }
    });
});

document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => {
        button.closest("dialog").close();
    });
});