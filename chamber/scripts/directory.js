document.documentElement.classList.add("js");

document.querySelector("#currentYear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

menuToggle.addEventListener("click", function () {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    navigation.classList.toggle("is-open", !isExpanded);
});

const membersContainer = document.querySelector("#members");
const directoryStatus = document.querySelector("#directory-status");
const gridViewButton = document.querySelector("#grid-view");
const listViewButton = document.querySelector("#list-view");

gridViewButton.addEventListener("click", function () {
    membersContainer.classList.add("business-grid");
    membersContainer.classList.remove("business-list");
    gridViewButton.setAttribute("aria-pressed", "true");
    listViewButton.setAttribute("aria-pressed", "false");
});

listViewButton.addEventListener("click", function () {
    membersContainer.classList.remove("business-grid");
    membersContainer.classList.add("business-list");
    gridViewButton.setAttribute("aria-pressed", "false");
    listViewButton.setAttribute("aria-pressed", "true");
});

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
    const address = document.createElement("p");
    address.textContent = member.address;
    const phone = document.createElement("p");
    phone.textContent = member.phone;
    const website = document.createElement("p");
    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = "Visit website";
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    website.appendChild(websiteLink);

    const membership = document.createElement("p");
    let membershipLevel = "Member";
    if (member.membership === 2) {
        membershipLevel = "Silver";
    } else if (member.membership === 3) {
        membershipLevel = "Gold";
    }
    membership.textContent = "Membership: " + membershipLevel;

    const description = document.createElement("p");
    description.textContent = member.description;
    information.appendChild(address);
    information.appendChild(phone);
    information.appendChild(website);
    information.appendChild(membership);
    information.appendChild(description);
    details.appendChild(image);
    details.appendChild(information);
    card.appendChild(heading);
    card.appendChild(tagline);
    card.appendChild(details);

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

        membersContainer.textContent = "";
        for (let i = 0; i < members.length; i++) {
            membersContainer.appendChild(createMemberCard(members[i], i));
        }
        directoryStatus.textContent = `${members.length} chamber members`;
    } catch (error) {
        console.error("Unable to load chamber members.", error);
        directoryStatus.textContent = "Member information could not be loaded. Please try again later.";
    }
}

loadMembers();