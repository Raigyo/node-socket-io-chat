// Script component managing client events and displaying

document.querySelector(".chat[data-chat=person0]").classList.add("active-chat");
document.querySelector(".person[data-chat=person0]").classList.add("active");

let friends = {
    list: document.querySelector("ul.people"),
    all: document.querySelectorAll(".left .person"),
    name: "",
  },
  chat = {
    container: document.querySelector(".container .right"),
    current: null,
    person: null,
    name: document.querySelector(".container .right .top .name"),
  };

// Opening of the modal on the list of connected users
const openUsersModal = () => {
  modalContainer.querySelector("#contentUsername").classList.add("none");
  modalContainer.querySelector("#contentUsers").classList.remove("none");
  modalContainer.classList.remove("out");
  document.body.classList.add("modal-active");
};

// Verification of the usability of the link to the modal users
const checkLinkUsersModal = () => {
  if (chat.person === "person0" || chat.person === null) {
    chat.name.addEventListener("click", openUsersModal, false);
    chat.name.style.cursor = "pointer";
  } else {
    chat.name.removeEventListener("click", openUsersModal, false);
    chat.name.style.cursor = "default";
  }
};

checkLinkUsersModal();

const setAciveChat = (f) => {
  friends.list.querySelector(".active").classList.remove("active");
  f.classList.add("active");
  chat.current = chat.container.querySelector(".active-chat");
  chat.person = f.getAttribute("data-chat");
  chat.current.classList.remove("active-chat");
  chat.container
    .querySelector(`[data-chat="${chat.person}"]`)
    .classList.add("active-chat");
  friends.name = f.querySelector(".name").innerText;
  chat.name.innerHTML = friends.name;
  checkLinkUsersModal();
};

/* Modal */

let modalContainer = document.body.querySelector("#modal-container"),
  listUsers = modalContainer.querySelector("#contentUsers ul");

// Opening of the modal on the request of the username
const openUsernameModal = () => {
  modalContainer.querySelector("#contentUsername").classList.remove("none");
  modalContainer.querySelector("#contentUsers").classList.add("none");
  modalContainer.classList.remove("out");
  document.body.classList.add("modal-active");
};

// Close modal
const closeModal = () => {
  modalContainer.classList.add("out");
  document.body.classList.remove("modal-active");
};

// Update of active users
const updateUsers = (users) => {
  listUsers.innerHTML = "";
  for (let i in users) {
    listUsers.innerHTML += `<li>${users[i]}</li>`;
  }
  // update text on the left with number of users in chat
  let text = `Discussion générale (${users.length})`;
  friends.all[0].querySelector(".name").innerHTML = text;
  // same with the title of the general chat
  if (chat.person === "person0" || chat.person === null)
    document.body.querySelector("#infoPersonTop").innerHTML = text;
};

// msg
let globalChat = chat.container.querySelector(".chat[data-chat=person0]");

// msg when a new user is connecting
const messageNewUser = (newUsername) => {
  let message = `<div class="conversation-start">
                  <span>${newUsername} a rejoint le chat!</span>
                </div>`;
  globalChat.insertAdjacentHTML("beforeend", message);
};

// msg when a  user is leaving
const messageLeaveUser = (leaveUsername) => {
  let message = `<div class="conversation-start">
                  <span>${leaveUsername} a quitté le chat!</span>
                </div>`;
  // globalChat.innerHTML += message; // reload all dom
  // use instead:
  globalChat.insertAdjacentHTML("beforeend", message); // add in dom
};

// display msg of current user
const showMyMessage = (text, dataChat) => {
  let message = `<div class="bubble name me">${text}</div>`;
  // console.log("dataChat:", dataChat);
  chat.container
    .querySelector(`.chat[data-chat="${dataChat}"]`)
    .insertAdjacentHTML("beforeend", message);
};

// display msg of other users
const showNewMessage = (text, usernameSender, dataChat) => {
  let message = `<div class="bubble name you"><span class="username">${usernameSender}</span>${text}</div>`;
  // globalChat.insertAdjacentHTML("beforeend", message);
  chat.container
    .querySelector(`.chat[data-chat="${dataChat}"]`)
    .insertAdjacentHTML("beforeend", message);
};

// Writing information
let someoneWriting = document.body.querySelector(".someoneWriting");
// Display info msg about writing
const showSomeoneWriting = (usernameWriting, dataChat) => {
  console.log("chat.person: ", chat.person);
  console.log("dataChat", dataChat, "---", usernameWriting);
  if (
    chat.person === dataChat ||
    (dataChat === "person0" && chat.person === null)
  ) {
    someoneWriting.innerHTML = `${usernameWriting} est en train d\'écrire...`;
    someoneWriting.classList.remove("none");
  }
};

// Remove info msg about writing
const removeSomeoneWriting = (dataChat) => {
  if (
    chat.person === dataChat ||
    (dataChat === "person0" && chat.person === null)
  ) {
    someoneWriting.classList.add("none");
  }
};

// Messaging: Friends list + Chats

// Display of users on login
const setFriends = (users, socketIDs, personalUsername) => {
  for (let i = 0; i < users.length; i++) {
    if (personalUsername != users[i]) addUserChat(users[i], socketIDs[i]);
  }
};

// Reloading links between friends and messaging
const updateFriends = () => {
  friends.all = document.querySelectorAll(".left .person");
  friends.all.forEach((f) => {
    f.addEventListener("mousedown", () => {
      f.classList.contains("active") || setAciveChat(f);
    });
  });
};
updateFriends();

// add user to private messaging
const addUserChat = (newUserName, newSocketID) => {
  // Friend
  let element = `<li class="person" data-chat="${newSocketID}">
                <span class="name">${newUserName}</span><br/>
                <span class="preview">Message privé</span>
              </li>`;
  friends.list.insertAdjacentHTML("beforeend", element);

  // Chats
  element = `<div class="chat" data-chat="${newSocketID}"></div>`;
  let lastChat = chat.container.querySelectorAll(".chat");
  lastChat = lastChat[lastChat.length - 1]; // target last id
  lastChat.insertAdjacentHTML("afterend", element);

  updateFriends();
};

// delete user from private messaging
const removeUserChat = (oldSocketID) => {
  // chain main chat window if needed
  if (chat.person === oldSocketID) setAciveChat(friends.all[0]);
  // delete friend from list
  let element = friends.list.querySelector(
    `.person[data-chat="${oldSocketID}"]`
  );
  element.parentNode.removeChild(element);
  // because removeChild is one of the only way to remove an element with all browsers
  // delete messaging
  element = chat.container.querySelector(`.person[data-chat="${oldSocketID}"]`);
  element.parentNode.removeChild(element);

  updateFriends();
};
