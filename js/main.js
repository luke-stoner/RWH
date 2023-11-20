document.addEventListener("DOMContentLoaded", function () {
  new fullpage("#fullpage", {
    sectionsColor: [
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
    ],
    navigation: true,
    navigationPosition: "right",
    
  });
});


document.addEventListener("DOMContentLoaded", function () {
  // Select all sections
  var sections = document.querySelectorAll(".section");

  // HTML content for the news container
  var newsContainerHTML = `
        <div class="news-container">
            <div class="title">
                Breaking News
            </div>
            <ul>
                <li>Kane is a goated JS developer!</li>
                <li>Luke really works for the CIA!</li>
                <li>Andrew is a delusional Eagles fan. Go Cowboys!</li>
            </ul>
        </div>
    `;

  // Append the news container to each section except #section-1
  sections.forEach(function (section) {
    // Check if the section is not #section-1
    if (section.id !== "section-1") {
      section.insertAdjacentHTML("beforeend", newsContainerHTML);
    }
  });
});
