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

settingsFunctions.enableHighlightParagraph = (data) => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  timeUpdateFunctions.highlightParagraph = (audioPlayer) => {
    let marker;
    for (const [key, value] of Object.entries(data.timestamps)) {
      if (value < audioPlayer.currentTime + 0.5) {
        marker = key;
      }  else {
        break;
      }
    }

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
      paragraphs.forEach(paragraph => {
        const hasButton = paragraph.querySelector('.button-left-of-paragraph');

        if (paragraph === hoveredParagraph && !hasButton) {
          const playButton = document.createElement("button");
          playButton.classList.add("button-left-of-paragraph");
          paragraph.append(playButton);

          const paragraphId = paragraph.dataset.beyondwordsParagraphId;
          const timestamp = data.timestamps[paragraphId];

          playButton.onclick = () => {
            audioPlayer.currentTime = timestamp;
            audioPlayer.play();
          }
        } else if (paragraph !== hoveredParagraph && hasButton) {
          paragraph.querySelector('.button-left-of-paragraph').remove();
        }
      });
    };
  });
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
};

main();
