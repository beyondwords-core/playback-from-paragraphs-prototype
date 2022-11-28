const main = async () => {
  const data = await fetch("data.json").then(r => r.json());

  const audioPlayer = document.getElementById("audio-player");
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(paragraph => {
    const paragraphId = paragraph.dataset.beyondwordsParagraphId;
    const timestamp = data.timestamps[paragraphId];

    const playButton = document.createElement("button");
    paragraph.parentNode.insertBefore(playButton, paragraph);

    playButton.innerText = "Play from here";
    playButton.onclick = () => {
      audioPlayer.currentTime = timestamp;
      audioPlayer.play();
    }
  });
}

main();
