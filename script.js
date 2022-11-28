const settingsFunctions = {};
const timeUpdateFunctions = {};

const main = async () => {
  const data = await fetch("data.json").then(r => r.json());

  const prototypeSettings = document.getElementById("prototype-settings");
  const checkboxes = prototypeSettings.querySelectorAll("input[type='checkbox']");

  checkboxes.forEach(c => c.checked && applySetting(c, data));
  checkboxes.forEach(c => c.onchange = () => applySetting(c, data));

  const audioPlayer = document.getElementById("audio-player");
  audioPlayer.ontimeupdate = () => applyTimeUpdate(audioPlayer);
};

const applySetting = (checkbox, data) => {
  if (checkbox.checked) {
    settingsFunctions[`enable${checkbox.id}`](data);
  } else {
    settingsFunctions[`disable${checkbox.id}`](data);
  }
};

const applyTimeUpdate = (audioPlayer) => {
  Object.values(timeUpdateFunctions).forEach(f => f(audioPlayer));
};

settingsFunctions.enableButtonsBetweenParagraphs = async (data) => {
  const audioPlayer = document.getElementById("audio-player");
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(paragraph => {
    const paragraphId = paragraph.dataset.beyondwordsParagraphId;
    const timestamp = data.timestamps[paragraphId];

    const playButton = document.createElement("button");
    playButton.classList.add("button-between-paragraphs");
    paragraph.parentNode.insertBefore(playButton, paragraph);

    const minutes = String(Math.floor(timestamp / 60)).padStart(2, "0");
    const seconds = String(Math.floor(timestamp % 60)).padStart(2, "0");

    playButton.innerText = `${minutes}:${seconds}`;
    playButton.onclick = () => {
      audioPlayer.currentTime = timestamp;
      audioPlayer.play();
    }
  });
};

settingsFunctions.disableButtonsBetweenParagraphs = () => {
  const playButtons = document.querySelectorAll(".button-between-paragraphs");
  playButtons.forEach(b => b.remove());
};

const currentMarker = (audioPlayer, data) => {
  let marker;
  for (const [key, value] of Object.entries(data.timestamps)) {
    if (value < audioPlayer.currentTime + 0.5) {
      marker = key;
    }  else {
      break;
    }
  }

  return marker;
};

settingsFunctions.enableHighlightParagraph = (data) => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  timeUpdateFunctions.highlightParagraph = (audioPlayer) => {
    const marker = currentMarker(audioPlayer, data);

    paragraphs.forEach(paragraph => {
      const paragraphId = paragraph.getAttribute("data-beyondwords-paragraph-id");
      const child = paragraph.children[0];
      const hasMarker = child && child.classList.contains("beyondwords-current");

      if (paragraphId === marker && !hasMarker) {
        const markElement = document.createElement("mark");
        markElement.classList.add("beyondwords-current");
        moveChildren(paragraph, markElement);
        paragraph.append(markElement);
      } else if (paragraphId !== marker && hasMarker) {
        moveChildren(child, paragraph);
        child.remove();
      }
    });
  }

  const audioPlayer = document.getElementById("audio-player");
  timeUpdateFunctions.highlightParagraph(audioPlayer);
};

settingsFunctions.disableHighlightParagraph = () => {
  delete timeUpdateFunctions.highlightParagraph;

  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

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

settingsFunctions.enableLeftButtonWhenHovering = (data) => {
  const audioPlayer = document.getElementById("audio-player");
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(hoveredParagraph => {
    hoveredParagraph.onmouseover = () => {
      const marker = currentMarker(audioPlayer, data);

      paragraphs.forEach(paragraph => {
        const hasButton = paragraph.querySelector('.button-left-of-paragraph');

        if (paragraph === hoveredParagraph && !hasButton) {
          const playButton = document.createElement("button");
          const paragraphId = paragraph.getAttribute("data-beyondwords-paragraph-id");

          const { height } = paragraph.getBoundingClientRect();
          const marginTop = height / 2 - 16;
          playButton.style.marginTop = `${marginTop}px`;

          playButton.classList.add("button-left-of-paragraph");
          if (paragraphId === marker && !audioPlayer.paused) {
            playButton.classList.add("pause");
          }
          paragraph.append(playButton);

          const timestamp = data.timestamps[paragraphId];

          playButton.onclick = (event) => {
            audioPlayer.currentTime = timestamp;

            if (playButton.classList.contains("pause")) {
              audioPlayer.pause();
            } else {
              audioPlayer.play();
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
    const marker = currentMarker(audioPlayer, data);

    paragraphs.forEach(paragraph => {
      const playButton = paragraph.querySelector('.button-left-of-paragraph');
      if (!playButton) { return; }

      const paragraphId = paragraph.dataset.beyondwordsParagraphId;
      if (paragraphId === marker && !audioPlayer.paused) {
        playButton.classList.add("pause");
      } else {
        playButton.classList.remove("pause");
      }
    });
  };
};

settingsFunctions.disableLeftButtonWhenHovering = () => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

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
  const audioPlayer = document.getElementById("audio-player");
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(paragraph => {
    paragraph.onclick = () => {
      const paragraphId = paragraph.dataset.beyondwordsParagraphId;
      const timestamp = data.timestamps[paragraphId];

      audioPlayer.currentTime = timestamp;
      audioPlayer.play();
    };

    const child = paragraph.children[0];
    const hasOtherMarker = child && child.classList.contains("beyondwords-current");
    const parentNode = hasOtherMarker ? child : paragraph;

    const markElement = document.createElement("mark");
    markElement.classList.add("click-to-play");
    moveChildren(parentNode, markElement);
    parentNode.append(markElement);
  });
};

settingsFunctions.disableClickParagraphText = () => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(paragraph => {
    paragraph.onclick = () => {};

    const markers = document.querySelectorAll('.click-to-play');
    markers.forEach(marker => {
      moveChildren(marker, marker.parentNode);
      marker.remove();
    });
  });
};

main();
