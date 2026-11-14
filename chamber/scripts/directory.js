document.documentElement.classList.add("js");

const yearElement = document.querySelector("#current-year");
const modifiedElement = document.querySelector("#last-modified");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const membersContainer = document.querySelector("#members");
const directoryStatus = document.querySelector("#directory-status");
const gridViewButton = document.querySelector("#grid-view");
const listViewButton = document.querySelector("#list-view");

yearElement.textContent = new Date().getFullYear();
modifiedElement.dateTime = new Date(document.lastModified).toISOString();
modifiedElement.textContent = new Date(document.lastModified).toLocaleString();

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
    navigation.classList.toggle("is-open", !isExpanded);
});

gridViewButton.addEventListener("click", () => setDirectoryView("grid"));
listViewButton.addEventListener("click", () => setDirectoryView("list"));

function setDirectoryView(view) {
    const isGrid = view === "grid";
    membersContainer.classList.toggle("business-list", !isGrid);
    gridViewButton.setAttribute("aria-pressed", String(isGrid));
    listViewButton.setAttribute("aria-pressed", String(!isGrid));
}

function createMemberCard(member, index) {
    const card = document.createElement("article");
    card.className = "business-card";

    const heading = document.createElement("h2");
    heading.className = "business-card-heading";
    heading.textContent = member.name;

    const tagline = document.createElement("p");
    tagline.className = "business-card-tagline";
    tagline.textContent = member.tagline;

    const details = document.createElement("div");
    details.className = "business-card-details";

    const image = document.createElement("img");
    image.className = "business-card-logo";
    image.src = `images/${member.image}`;
    image.alt = `${member.name} logo`;
    image.width = 160;
    image.height = 160;
    image.loading = index === 0 ? "eager" : "lazy";

    const information = document.createElement("div");
    information.className = "business-card-info";

    const address = document.createElement("p");
    address.textContent = member.address;
    const phone = document.createElement("p");
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
    phoneLink.textContent = member.phone;
    phone.append(phoneLink);

    const website = document.createElement("p");
    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = "Visit website";
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    website.append(websiteLink);

    const membership = document.createElement("p");
    const membershipLabel = ["", "Member", "Silver", "Gold"][member.membership];
    membership.textContent = "Membership: ";
    const level = document.createElement("span");
    level.className = "membership-level";
    level.textContent = membershipLabel;
    membership.append(level);

    const description = document.createElement("p");
    description.textContent = member.description;
    information.append(address, phone, website, membership, description);
    details.append(image, information);
    card.append(heading, tagline, details);

    return card;
}

async function loadMembers() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Member directory request failed: ${response.status}`);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member directory data must be an array.");
        }

        membersContainer.replaceChildren(...members.map(createMemberCard));
        directoryStatus.textContent = `${members.length} chamber members`;
    } catch (error) {
        console.error("Unable to load chamber members.", error);
        directoryStatus.textContent = "Member information could not be loaded. Please try again later.";
    }
}

loadMembers();
