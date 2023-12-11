// Set default ease
TweenMax.defaultEase = Linear.easeOut;

// Hide the news bar to start
const newsBar = document.getElementById("breaking-news");
newsBar.style.visibility = "hidden";

const video = document.getElementById("myVideo");
const acceptButton = document.getElementById("accept-button");

document.addEventListener("DOMContentLoaded", function () {
  var visitedCoverageByNetwork = false;

  var fullPageInstance = new fullpage("#fullpage", {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,

    onLeave: (origin, destination, direction) => {
      // Show/Hide breaking news bar
      if (destination.index === 0) {
        newsBar.style.visibility = "hidden";
      } else if (destination.index === 1 && !video.ended) {
        newsBar.style.visibility = "hidden";
      } else {
        newsBar.style.visibility = "visible";
      }

      const tl = new TimelineMax({ delay: 0.1 });

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

      if (destination.index == 5) {
        const candidateIntro = new CandidateIntroduction(
          candidate_descriptions
        );
      }

      if (destination.index == 6) {
        const volumeBubbles = new BubbleChart();
      }

      if (destination.index == 7) {
        const sentimentChart = new SentimentChart();
      }

      if (destination.index == 10) {
        const byNetwork = new ByNetworkVisual();
      }

      // Show the Bootstrap modal when destination index is 11
      if (destination.index == 12) {
        if (!visitedCoverageByNetwork) {
          setTimeout(function () {
            $("#network-modal").modal("show");
          }, 500);
        }
        visitedCoverageByNetwork = true;
      }

      if (destination.index === 15) {
        const ballotBox = document.getElementById("ballot-box");
        tl.fromTo(
            ballotBox,
            0.7,
            { x: "100%", opacity: 0, scale: 0.5 },
            { x: "-30%", opacity: 1, scale: 1, ease: Power2.easeOut }
        );

        tl.to(ballotBox, 1.5, {
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
  // navBar.style.visibility = "hidden";

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

  function disableScrolling() {
    fullPageInstance.setAllowScrolling(false);
    fullPageInstance.setKeyboardScrolling(false);
  }

  function enableScrolling() {
    fullPageInstance.setAllowScrolling(true);
    fullPageInstance.setKeyboardScrolling(true);
  }

  function videoEnded() {
    this.removeAttribute("controls");
    this.removeAttribute("data-autoplay");
    this.classList.add("video-fade-out");
    navBar.style.visibility = "visible";
    newsBar.style.visibility = "visible";
  }

  function handleModalVisibility() {
    const modalElements = document.querySelectorAll(".modal");
    if (modalElements.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Modal is visible
            disableScrolling();
          } else {
            // Modal is hidden
            enableScrolling();
          }
        });
      });

      modalElements.forEach((modalElement) => {
        observer.observe(modalElement);
      });
    }
  }

  function playProjectExplanationVideo() {
    var modal = document.querySelector("#introModal");
    var video = modal.querySelector("video");

    modal.addEventListener("hidden.bs.modal", function (e) {
      video.pause();
    });
  }

  // Call the function to start observing the modal visibility
  handleModalVisibility();
  playProjectExplanationVideo();
});
