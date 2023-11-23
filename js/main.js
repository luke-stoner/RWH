// Constants
const REPUBLICAN_RED = "#C90A3D";
const DEMOCRAT_BLUE = "#5768AC";
const INDEPENDENT_GRAY = "#808080";

// Set default ease
TweenMax.defaultEase = Linear.easeOut;

// Hide the news bar to start
const newsBar = document.getElementById("breaking-news");
newsBar.style.visibility = "hidden";

const video = document.getElementById("myVideo");
const acceptButton = document.getElementById("accept-button");

document.addEventListener("DOMContentLoaded", function () {
  var fullPageInstance = new fullpage("#fullpage", {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,

    onLeave: (origin, destination, direction) => {
      const tl = new TimelineMax({ delay: 0.1 });
      const newsBar = document.getElementById("breaking-news");

      if (destination.index === 0) {
        newsBar.style.visibility = "hidden";
      } else if (destination.index === 1 && !video.ended) {
        newsBar.style.visibility = "hidden";
      } else {
        newsBar.style.visibility = "visible";
      }

      if (destination.index === 2) {
        const whiteHouse = document.getElementById("white-house");
        tl.fromTo(
          whiteHouse,
          0.7,
          { x: "100%", opacity: 0, scale: 0.5 },
          { x: "-30%", opacity: 1, scale: 1, ease: Power2.easeOut }
        );

        tl.to(whiteHouse, 1.5, {
          scale: 0.95,
          yoyo: true,
          repeat: -1,
          ease: Power2.easeInOut,
        });
      }
    },
  });

  // Start with navbar hidden
  const navBar = document.getElementById("fp-nav");
  navBar.style.visibility = "hidden";

  // UNCOMMENT WHEN WE ARE OUT OF DEVELOPMENT
  // Disable scrolling initially
  // fullPageInstance.setAllowScrolling(false);
  // fullPageInstance.setKeyboardScrolling(false);

  // Event listeners to guide user through video playing process
  acceptButton.addEventListener("click", userAccepted);
  video.addEventListener("ended", videoEnded, false);

  function userAccepted() {
    fullPageInstance.moveSectionDown();
  }

  function videoEnded() {
    this.removeAttribute("controls");
    this.removeAttribute("data-autoplay");
    this.classList.add("video-fade-out");

    fullPageInstance.setAllowScrolling(true);
    fullPageInstance.setKeyboardScrolling(true);
    navBar.style.visibility = "visible";
    newsBar.style.visibility = "visible";
  }
});
