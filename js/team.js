const teamMembers = [
  {
    name: "Luke Stoner",
    university: "Harvard University",
    program: "MS - Data Science '24",
    linkedin: "https://www.linkedin.com/in/lukestoner/",
    github: "https://github.com/luke-stoner",
    imageSrc:
      "https://media.licdn.com/dms/image/D4E03AQEnyHbRnvMdGg/profile-displayphoto-shrink_400_400/0/1696390380862?e=1705536000&v=beta&t=YVfnb-FTaGbSGPzS6z8TAAuNz5lEaTFFW9m3TOcKdwI",
  },
  {
    name: "Andrew Sullivan",
    university: "Harvard University",
    program: "MS - Data Science '24",
    linkedin: "https://www.linkedin.com/in/andrewjosephsullivan/",
    github: "https://github.com/andrewsully",
    imageSrc:
      "https://media.licdn.com/dms/image/C4D03AQFcwzfZoC8I6g/profile-displayphoto-shrink_400_400/0/1620667606933?e=1705536000&v=beta&t=g8qIOwJFPNefHGwf-mCi3YODQJHJOhSyFctg1nIct5g",
  },
  {
    name: "Kane Norman",
    university: "Harvard University",
    program: "MS - Data Science '23",
    linkedin: "https://www.linkedin.com/in/kanenorman/",
    github: "https://github.com/kanenorman",
    imageSrc:
      "https://media.licdn.com/dms/image/D4E03AQGbvPkUI-QUpA/profile-displayphoto-shrink_400_400/0/1676916845284?e=1705536000&v=beta&t=kwoJyxVsjNtTxP9_N4qsh6DRxtFOt3_lOoipqi6-Wac",
  },
];

function createAndAppendElement(tagName, attributes, parentElement) {
  const element = document.createElement(tagName);
  for (const key in attributes) {
    element[key] = attributes[key];
  }
  parentElement.appendChild(element);
  return element;
}

const teamProfilesDiv = document.getElementById("team-profiles");

const containerDiv = createAndAppendElement(
  "div",
  { className: "container text-center" },
  teamProfilesDiv,
);

const rowDiv = createAndAppendElement(
  "div",
  { className: "row align-items-start" },
  containerDiv,
);

teamMembers.forEach((member) => {
  const memberDiv = createAndAppendElement("div", { className: "col" }, rowDiv);

  createAndAppendElement(
    "img",
    {
      src: member.imageSrc,
      alt: `${member.name} Portrait`,
      className: "rounded-circle",
      style: "height: 200px",
    },
    memberDiv,
  );

  createAndAppendElement("h5", { textContent: member.name }, memberDiv);

  createAndAppendElement(
    "h6",
    { innerHTML: `<small class="text-muted">${member.university}</small>` },
    memberDiv,
  );
  createAndAppendElement(
    "h6",
    { innerHTML: `<small class="text-muted">${member.program}</small>` },
    memberDiv,
  );

  const linkedinIcon = createAndAppendElement(
    "span",
    { className: "social-icon" },
    memberDiv,
  );
  linkedinIcon.innerHTML = `<a href="${member.linkedin}" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>`;

  const githubIcon = createAndAppendElement(
    "span",
    { className: "social-icon" },
    memberDiv,
  );
  githubIcon.innerHTML = `<a href="${member.github}" target="_blank"><i class="fa-brands fa-github"></i></a>`;
});
