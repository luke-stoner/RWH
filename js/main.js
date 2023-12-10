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
      // Show/Hide breaking news bar
      if (destination.index === 0) {
        newsBar.style.visibility = "hidden";
      } else if (destination.index === 1 && !video.ended) {
        newsBar.style.visibility = "hidden";
      } else {
        newsBar.style.visibility = "visible";
      }

      if (destination.index == 4) {
        const candidateIntro = new CandidateIntroduction(
          candidate_descriptions
        );
      }

      if (destination.index == 5) {
        const volumeBubbles = new BubbleChart();
      }

      if (destination.index == 6) {
        const sentimentChart = new SentimentChart();
      }

      if (destination.index == 9) {
        const byNetwork = new ByNetworkVisual();
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
    var playButton = document.querySelector(".play-vid");
    var modal = document.querySelector("#introModal");
    var video = modal.querySelector("video");

    playButton.addEventListener("click", function () {
      video.play();
    });

    modal.addEventListener("hidden.bs.modal", function (e) {
      video.pause();
    });
  }

  // Call the function to start observing the modal visibility
  handleModalVisibility();
  playProjectExplanationVideo();
});
