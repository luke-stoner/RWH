TweenMax.defaultEase = Linear.easeOut;

document.addEventListener("DOMContentLoaded", function () {
  var fullPageInstance = new fullpage("#fullpage", {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,

    onLeave: (origin, destination, direction) => {
      const tl = new TimelineMax({ delay: 0.1 });

      if (destination.index === 0 || destination.index === 1) {
        const newsBar = document.getElementById("breaking-news");
        newsBar.style.visibility = "hidden";
      }

      if (destination.index !== 0 && destination.index !== 1) {
        const newsBar = document.getElementById("breaking-news");
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

  fullPageInstance.setAllowScrolling(false);
  fullPageInstance.setKeyboardScrolling(false);

  function enableScrolling() {
    fullPageInstance.setAllowScrolling(true);
    fullPageInstance.setKeyboardScrolling(true);
    fullPageInstance.moveSectionDown();
  }
  const scrollButton = document.getElementById("accept-button");
  scrollButton.addEventListener("click", enableScrolling);
});

const REPUBLICAN_RED = "#C90A3D";
const DEMOCRAT_BLUE = "#5768AC";
const INDEPENDENT_GRAY = "#808080";
