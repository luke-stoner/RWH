class TeamMember {
  constructor(name, university, program, linkedin, github, imageSrc) {
    this.name = name;
    this.university = university;
    this.program = program;
    this.linkedin = linkedin;
    this.github = github;
    this.imageSrc = imageSrc;
  }

  createProfileElement() {
    const memberDiv = document.createElement("div");
    memberDiv.className = "col";

    this.createAndAppendElement(memberDiv, "img", {
      src: this.imageSrc,
      alt: `${this.name} Portrait`,
      className: "rounded-circle",
      style: "height: 200px",
    });

    this.createAndAppendElement(memberDiv, "h5", { textContent: this.name });

    this.createAndAppendElement(memberDiv, "h6", {
      innerHTML: `<small class="text-muted">${this.university}</small>`,
    });

    this.createAndAppendElement(memberDiv, "h6", {
      innerHTML: `<small class="text-muted">${this.program}</small>`,
    });

    const linkedinIcon = this.createAndAppendElement(memberDiv, "span", {
      className: "social-icon",
    });
    linkedinIcon.innerHTML = `<a href="${this.linkedin}" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>`;

    const githubIcon = this.createAndAppendElement(memberDiv, "span", {
      className: "social-icon",
    });
    githubIcon.innerHTML = `<a href="${this.github}" target="_blank"><i class="fa-brands fa-github"></i></a>`;

    return memberDiv;
  }

  createAndAppendElement(parentElement, tagName, attributes) {
    const element = document.createElement(tagName);
    for (const key in attributes) {
      element[key] = attributes[key];
    }
    parentElement.appendChild(element);
    return element;
  }
}

const teamMembers = [
  new TeamMember(
    "Luke Stoner",
    "Harvard University",
    "MS - Data Science '24",
    "https://www.linkedin.com/in/lukestoner/",
    "https://github.com/luke-stoner",
    "https://media.licdn.com/dms/image/D4E03AQEnyHbRnvMdGg/profile-displayphoto-shrink_800_800/0/1696390380862?e=1713398400&v=beta&t=1P34Y8U4pVLAaMhZDzqmwKpOXIbeFA101FFinf-fKVA"
  ),
  new TeamMember(
    "Andrew Sullivan",
    "Harvard University",
    "MS - Data Science '24",
    "https://www.linkedin.com/in/andrewjosephsullivan/",
    "https://github.com/andrewsully",
    "https://media.licdn.com/dms/image/C4D03AQFcwzfZoC8I6g/profile-displayphoto-shrink_800_800/0/1620667606933?e=1713398400&v=beta&t=_6sBB_En3LJKlQw5EveXM0ViXNl8Tylcl1Qkgw0smfk"  
  ),
  new TeamMember(
    "Kane Norman",
    "Harvard University",
    "MS - Data Science '23",
    "https://www.linkedin.com/in/kanenorman/",
    "https://github.com/kanenorman",
    "https://media.licdn.com/dms/image/D4E03AQGbvPkUI-QUpA/profile-displayphoto-shrink_800_800/0/1676916845284?e=1713398400&v=beta&t=6NcNkA2PEiZD849cwls4RmdQHPUw_gFAw83hlQ8sn8A"
  ),
];

const teamProfilesDiv = document.getElementById("team-profiles");
const containerDiv = document.createElement("div");
containerDiv.className = "container text-center";
teamProfilesDiv.appendChild(containerDiv);

const rowDiv = document.createElement("div");
rowDiv.className = "row align-items-start";
containerDiv.appendChild(rowDiv);

teamMembers.forEach((member) => {
  const memberProfile = member.createProfileElement();
  rowDiv.appendChild(memberProfile);
});
