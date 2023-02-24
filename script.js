const settingsFunctions = {};
const timeUpdateFunctions = {};
let startTimeAfterAd;

const main = async () => {
  const data = await fetch("data.json").then(r => r.json());
  const checkboxes = document.querySelectorAll("#prototype-settings > input[type='checkbox']")
  const dropdowns = document.querySelectorAll("#prototype-settings > select")

  checkboxes.forEach(c => c.checked && applyCheckbox(c, data));
  checkboxes.forEach(c => c.onchange = () => applyCheckbox(c, data));

  dropdowns.forEach(d => applyDropdown(d, data));
  dropdowns.forEach(d => d.onchange = () => applyDropdown(d, data));

  const player = BeyondWords.Player.instances()[0];
  player.mediaElement.video.ontimeupdate = () => applyTimeUpdate(player, data);
};

const applyCheckbox = (checkbox, data) => {
  if (checkbox.checked) {
    settingsFunctions[`enable${checkbox.id}`](data);
  } else {
    settingsFunctions[`disable${checkbox.id}`](data);
  }
};

const applyDropdown = (dropdown, data) => {
  settingsFunctions[`select${dropdown.id}`](dropdown.value, data);
};

let timesRemaining = 0;

const applyTimeUpdate = (player, data) => {
  if (startTimeAfterAd && player.advertIndex === -1) {
    if (timesRemaining === 0) {
      startTimeAfterAd = null;
    } else {
      player.currentTime = startTimeAfterAd;
      timesRemaining -= 1;
    }
  }

  Object.values(timeUpdateFunctions).forEach(f => f(player, data));
};

settingsFunctions.enableButtonsBetweenParagraphs = async (data) => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach((paragraph, i) => {
    if (i === 0) { return; }

    const marker = paragraph.dataset.beyondwordsMarker;
    const timestamp = data.paragraphTimestamps[marker];

    const playButton = document.createElement("button");
    playButton.classList.add("button-between-paragraphs");
    paragraph.parentNode.insertBefore(playButton, paragraph);

    const minutes = String(Math.floor(timestamp / 60)).padStart(2, "0");
    const seconds = String(Math.floor(timestamp % 60)).padStart(2, "0");

    playButton.innerText = `${minutes}:${seconds}`;
    playButton.onclick = () => {
      const player = BeyondWords.Player.instances()[0];
      const isAdvert = player.advertIndex !== -1;

      if (isAdvert) {
        startTimeAfterAd = timestamp - 0.2;
        timesRemaining = 3;
      } else {
        player.currentTime = timestamp - 0.2;
      }

      player.playbackState = "playing";
    }
  });
};

settingsFunctions.disableButtonsBetweenParagraphs = () => {
  const playButtons = document.querySelectorAll(".button-between-paragraphs");
  playButtons.forEach(b => b.remove());
};

const currentMarker = (currentTime, data) => {
  let marker;
  for (const [key, value] of Object.entries(data.paragraphTimestamps)) {
    if (value < currentTime + 0.5) {
      marker = key;
    }  else {
      break;
    }
  }

  return marker;
};

settingsFunctions.enableHighlightCurrentParagraph = (data) => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  timeUpdateFunctions.highlightParagraph = (player) => {
    const isAdvert = player.advertIndex !== -1;
    const current = currentMarker(isAdvert ? startTimeAfterAd : player.currentTime, data);

    paragraphs.forEach(paragraph => {
      const marker = paragraph.getAttribute("data-beyondwords-marker");
      const child = paragraph.children[0];
      const hasMarker = child && child.classList.contains("beyondwords-current");

      if (marker === current && !hasMarker) {
        const markElement = document.createElement("mark");
        markElement.classList.add("beyondwords-current");
        moveChildren(paragraph, markElement);
        paragraph.append(markElement);
      } else if (marker !== current && hasMarker) {
        moveChildren(child, paragraph);
        child.remove();
      }
    });
  }

  const player = BeyondWords.Player.instances()[0];
  timeUpdateFunctions.highlightParagraph(player);
};

settingsFunctions.disableHighlightCurrentParagraph = () => {
  delete timeUpdateFunctions.highlightParagraph;

  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(paragraph => {
    const child = paragraph.children[0];
    const hasMarker = child && child.classList.contains("beyondwords-current");

    if (hasMarker) {
      moveChildren(child, paragraph);
      child.remove();
    }
  });
};

const moveChildren = (fromNode, toNode) => {
  while (fromNode.childNodes.length) {
    toNode.appendChild(fromNode.firstChild);
  }
};

settingsFunctions.enableHighlightHoveredParagraph = () => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(paragraph => {
    const child = paragraph.children[0];
    const hasOtherMarker = child && child.classList.contains("beyondwords-current");
    const parentNode = hasOtherMarker ? child : paragraph;

    const markElement = document.createElement("mark");
    markElement.classList.add("hover-marker");
    moveChildren(parentNode, markElement);
    parentNode.append(markElement);
  });
};

settingsFunctions.disableHighlightHoveredParagraph = () => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(paragraph => {
    const markers = document.querySelectorAll(".hover-marker");
    markers.forEach(marker => {
      moveChildren(marker, marker.parentNode);
      marker.remove();
    });
  });
};

settingsFunctions.enableLeftButtonWhenHovering = (data) => {
  const player = BeyondWords.Player.instances()[0];
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(hoveredParagraph => {
    hoveredParagraph.onmouseover = () => {
      const current = currentMarker(player.currentTime, data);

      paragraphs.forEach(paragraph => {
        const hasButton = paragraph.querySelector('.button-left-of-paragraph');

        if (paragraph === hoveredParagraph && !hasButton) {
          const playButton = document.createElement("button");
          const marker = paragraph.getAttribute("data-beyondwords-marker");

          const { height } = paragraph.getBoundingClientRect();
          const marginTop = height / 2 - 16;
          playButton.style.marginTop = `${marginTop}px`;

          playButton.classList.add("button-left-of-paragraph");
          if (marker === current && player.playbackState === "playing") {
            playButton.classList.add("pause");
          }
          paragraph.append(playButton);

          const timestamp = data.paragraphTimestamps[marker];

          playButton.onclick = (event) => {
            const current = currentMarker(player.currentTime, data);
            const isAdvert = player.advertIndex !== -1;

            if (marker !== current) {
              if (isAdvert) {
                startTimeAfterAd = timestamp - 0.2;
                timesRemaining = 3;
              } else {
                player.currentTime = timestamp - 0.2;
              }
            }

            if (playButton.classList.contains("pause")) {
              player.playbackState = "paused";
            } else {
              player.playbackState = "playing";
            }

            event.stopPropagation();
          }
        } else if (paragraph !== hoveredParagraph && hasButton) {
          paragraph.querySelector('.button-left-of-paragraph').remove();
        }
      });
    };
  });

  timeUpdateFunctions.leftButton = () => {
    const current = currentMarker(player.currentTime, data);

    paragraphs.forEach(paragraph => {
      const playButton = paragraph.querySelector('.button-left-of-paragraph');
      if (!playButton) { return; }

      const marker = paragraph.dataset.beyondwordsMarker;
      if (marker === current && player.playbackState === "playing") {
        playButton.classList.add("pause");
      } else {
        playButton.classList.remove("pause");
      }
    });
  };
};

settingsFunctions.disableLeftButtonWhenHovering = () => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(paragraph => {
    paragraph.onmouseover = () => {};

    const playButton = paragraph.querySelector('.button-left-of-paragraph');

    if (playButton) {
      playButton.remove();
    }
  });

  delete timeUpdateFunctions.leftButton;
};

settingsFunctions.enableClickParagraphText = (data) => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(paragraph => {
    paragraph.onclick = () => {
      const player = BeyondWords.Player.instances()[0];
      const isAdvert = player.advertIndex !== -1;

      const marker = paragraph.dataset.beyondwordsMarker;
      const timestamp = data.paragraphTimestamps[marker];
      const current = currentMarker(player.currentTime, data);

      if (marker === current && player.playbackState !== "playing") {
        player.playbackState = "playing";
      } else if (marker === current && player.playbackState === "playing") {
        player.playbackState = "paused";
      } else {
        if (isAdvert) {
          startTimeAfterAd = timestamp - 0.2;
          timesRemaining = 3;
        } else {
          player.currentTime = timestamp - 0.2;
        }

        player.playbackState = "playing";
      }
    };

    paragraph.classList.add("click-to-play");
  });
};

settingsFunctions.disableClickParagraphText = () => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-marker]");

  paragraphs.forEach(paragraph => {
    paragraph.onclick = () => {};
    paragraph.classList.remove("click-to-play");
  });
};

settingsFunctions.selectPlayerStyle = (playerStyle) => {
  BeyondWords.Player.instances()[0].playerStyle = playerStyle;
};

settingsFunctions.selectWidgetStyle = (widgetStyle) => {
  BeyondWords.Player.instances()[0].widgetStyle = widgetStyle;
};

settingsFunctions.selectWidgetPosition = (widgetPosition) => {
  BeyondWords.Player.instances()[0].widgetPosition = widgetPosition;
};

settingsFunctions.selectWidgetWidth = (widgetWidth) => {
  BeyondWords.Player.instances()[0].widgetWidth = widgetWidth;
};

settingsFunctions.selectSkipButtonStyle = (skipButtonStyle) => {
  BeyondWords.Player.instances()[0].skipButtonStyle = skipButtonStyle;
};

settingsFunctions.selectColorTheme = (colorTheme) => {
  if (colorTheme === "light") {
    BeyondWords.Player.instances()[0].textColor = "#111";
    BeyondWords.Player.instances()[0].backgroundColor = "#F5F5F5";
    BeyondWords.Player.instances()[0].iconColor = "rgba(0, 0, 0, 0.8)";
  } else {
    BeyondWords.Player.instances()[0].textColor = "#eee";
    BeyondWords.Player.instances()[0].backgroundColor = "#333";
    BeyondWords.Player.instances()[0].iconColor = "#bbb";
  }
};
