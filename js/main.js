TweenMax.defaultEase = Linear.easeOut;

document.addEventListener("DOMContentLoaded", function () {
  new fullpage("#fullpage", {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",

    onLeave: (origin, destination, direction) => {
      const section = destination.item;
      const tl = new TimelineMax({ delay: 0.1 });

      if (destination.index === 1) {
        const whiteHouse = document.getElementById("white-house");
        tl.fromTo(
          whiteHouse,
          0.7,
          { x: "100%", opacity: 0, scale: 0.5 }, // Initial position and size
          { x: "-30%", opacity: 1, scale: 1, ease: Power2.easeOut } // Animated position and size
        );

        // Add additional animations or styles here
        tl.to(whiteHouse, 1.5, {
          scale: 0.95,
          yoyo: true,
          repeat: -1,
          ease: Power2.easeInOut, // Use easeInOut for smoother scaling
        }); // Scale up and down repeatedly
      }
    },
  });
});

const REPUBLICAN_RED = "#FA5A50";
const DEMOCRAT_BLUE = "#5768AC";
const INDEPENDENT_GRAY = "#808080";
