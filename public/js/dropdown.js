const socket = io();

const $rooms = document.querySelector("#rooms");
const $emptyTemplate = document.querySelector("#empty-template").innerHTML;
const $roomsTemplate = document.querySelector("#rooms-template").innerHTML;

let rooms = [];

window.addEventListener("load", () => {
  fetch("/api/rooms", {
    method: "GET",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((response) => {
      rooms = response;
      if (rooms.length === 0) {
        const text = "No rooms available!";
        const html = Mustache.render($emptyTemplate, {
          text,
        });
        return ($rooms.innerHTML = html);
      }
      const html = Mustache.render($roomsTemplate, {
        options: rooms,
      });
      $rooms.innerHTML = html;
    });
});
