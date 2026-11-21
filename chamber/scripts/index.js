import { loadWeather } from "./weather.js";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYearElement = document.querySelector("#currentYear");
const lastModifiedElement = document.querySelector("#lastModified");
const spotlightContainer = document.querySelector("#spotlight-cards");
const spotlightStatus = document.querySelector("#spotlight-status");

document.documentElement.classList.add("js");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", function () {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", !isExpanded);
        navigation.classList.toggle("is-open", !isExpanded);
    });
}

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

if (lastModifiedElement) {
    lastModifiedElement.textContent = document.lastModified;
}

loadWeather();

if (spotlightContainer && spotlightStatus) {
    loadSpotlights();
}

async function loadSpotlights() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error("Member data request failed: " + response.status);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member data must be an array.");
        }

        const eligibleMembers = [];
        for (let i = 0; i < members.length; i++) {
            if (members[i].membership === 2 || members[i].membership === 3) {
                eligibleMembers.push(members[i]);
            }
        }

        if (eligibleMembers.length === 0) {
            spotlightStatus.textContent = "No silver or gold members are available to feature.";
            return;
        }
        if (eligibleMembers.length < 2) {
            spotlightStatus.textContent = "At least two silver or gold members are needed for spotlights.";
            return;
        }

        let spotlightCount = 2;
        if (eligibleMembers.length > 2 && Math.random() >= 0.5) {
            spotlightCount = 3;
        }

        const shuffledMembers = [];
        for (let i = 0; i < eligibleMembers.length; i++) {
            shuffledMembers.push(eligibleMembers[i]);
        }

        for (let i = shuffledMembers.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const currentMember = shuffledMembers[i];
            shuffledMembers[i] = shuffledMembers[randomIndex];
            shuffledMembers[randomIndex] = currentMember;
        }

        spotlightContainer.textContent = "";
        if (spotlightCount === 3) {
            spotlightContainer.classList.add("spotlight-count-3");
        } else {
            spotlightContainer.classList.remove("spotlight-count-3");
        }

        for (let i = 0; i < spotlightCount; i++) {
            const card = createSpotlightCard(shuffledMembers[i]);
            spotlightContainer.appendChild(card);
        }
        spotlightStatus.textContent = "Showing " + spotlightCount + " silver and gold members.";
    } catch (error) {
        console.error("Unable to load spotlight members.", error);
        spotlightStatus.textContent = "Spotlight members could not be loaded right now.";
    }
}

function createSpotlightCard(member) {
    const card = document.createElement("article");
    card.className = "business-card spotlight-card";

    const heading = document.createElement("h3");
    heading.className = "business-card-heading";
    heading.textContent = member.name;

    const details = document.createElement("div");
    details.className = "business-card-details";

    const logo = document.createElement("img");
    logo.className = "business-card-logo";
    logo.src = "images/" + member.image;
    logo.alt = member.name + " logo";
    logo.width = 160;
    logo.height = 160;
    logo.loading = "lazy";

    const information = document.createElement("div");
    const phone = document.createElement("p");
    phone.textContent = "Phone: " + member.phone;

    const address = document.createElement("p");
    address.textContent = "Address: " + member.address;

    const website = document.createElement("p");
    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = member.website;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    website.appendChild(document.createTextNode("Website: "));
    website.appendChild(websiteLink);

    const membership = document.createElement("p");
    membership.className = "spotlight-membership";
    membership.textContent = "Membership: ";
    if (member.membership === 3) {
        membership.textContent += "Gold";
    } else {
        membership.textContent += "Silver";
    }

    information.appendChild(phone);
    information.appendChild(address);
    information.appendChild(website);
    information.appendChild(membership);
    details.appendChild(logo);
    details.appendChild(information);
    card.appendChild(heading);
    card.appendChild(details);

    return card;
}