const list = [];
const RENDER_EVENT = "render-event";
const SAVED_EVENT = "saved-item";
const STORAGE_KEY = "ZENBOOK";

function generateId() {
  return +new Date();
}

function generateObjectItem(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findItem(id) {
  for (const item of list) {
    if (id === item.id) {
      return item;
    }
  }
  return null;
}

function findIndex(id) {
  for (const index in list) {
    if (list[index].id === id) {
      return index;
    }
  }
  return -1;
}

function addToFinishedRead(id) {
  const stagingItem = findItem(id);

  if (stagingItem === null) return;

  stagingItem.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addToUnfinishedRead(id) {
  const stagingItem = findItem(id);

  if (stagingItem === null) return;

  stagingItem.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeItem(id) {
  console.log(id);
  const stagingIndex = findIndex(id);

  if (stagingIndex === -1) return;

  list.splice(stagingIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addItem() {
  const title = document.getElementById("inputTitle").value;
  const author = document.getElementById("inputAuthor").value;
  const year = document.getElementById("inputYear").value;
  const isComplete = document.getElementById("markAsRead").checked;
  const id = generateId();
  const objectItem = generateObjectItem(
    id,
    title,
    author,
    parseInt(year),
    isComplete
  );
  removeField();
  list.push(objectItem);
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(list);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const item of data) {
      list.push(item);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Your browser dont have local storage");
    return false;
  }

  return true;
}

function removeField() {
  const title = document.getElementById("inputTitle");
  const author = document.getElementById("inputAuthor");
  const year = document.getElementById("inputYear");
  const isComplete = document.getElementById("markAsRead");

  title.value = "";
  author.value = "";
  year.value = "";
  isComplete.checked = false;
}

function createListItem(objectItem) {
  const textTitle = document.createElement("h3");
  textTitle.classList.add("itemTitle");
  textTitle.innerHTML = objectItem.title;

  const textAuhtor = document.createElement("p");
  textAuhtor.innerHTML = `Author: ${objectItem.author}`;

  const textYear = document.createElement("p");
  textYear.innerHTML = `Year: ${objectItem.year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuhtor, textYear);

  const container = document.createElement("div");
  container.classList.add("item");
  container.setAttribute("id", objectItem.id);
  container.append(textContainer);

  const buttonAction = document.createElement("div");
  buttonAction.classList.add("buttonContainer");

  const removeButton = document.createElement("button");
  removeButton.classList.add("removeButton");
  removeButton.innerHTML = "Remove";
  removeButton.addEventListener("click", () => removeItem(objectItem.id));

  if (!objectItem.isComplete) {
    const finishedButton = document.createElement("button");
    finishedButton.classList.add("moveButton");

    finishedButton.innerHTML = "Finish read";

    finishedButton.addEventListener("click", () =>
      addToFinishedRead(objectItem.id)
    );

    buttonAction.append(finishedButton, removeButton);
    container.append(buttonAction);
  } else {
    const unfinishedButton = document.createElement("button");
    unfinishedButton.classList.add("moveButton");

    unfinishedButton.innerHTML = "Unfinish read";

    unfinishedButton.addEventListener("click", () =>
      addToUnfinishedRead(objectItem.id)
    );

    buttonAction.append(unfinishedButton, removeButton);
    container.append(buttonAction);
  }
  saveData();
  return container;
}

function appendItem() {
  const unfinishedread = document.getElementById("unfinishedRead");
  unfinishedread.innerHTML = "";

  const finishedread = document.getElementById("finishedRead");
  finishedread.innerHTML = "";

  for (const listItem of list) {
    const item = createListItem(listItem);
    if (!listItem.isComplete) {
      unfinishedread.append(item);
    } else {
      finishedread.append(item);
    }
  }
}

function filterItem() {
  const filterTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const titleNodes = document.querySelectorAll("h3.itemTitle");

  titleNodes.forEach((child, index) => {
    const currentTitle = child.innerHTML.toLowerCase();
    const isInclude = currentTitle.includes(filterTitle);
    const grandParent = child.parentNode.parentNode;

    if (!isInclude) {
      grandParent.setAttribute("class", "hide");
    }

    if (isInclude || filterTitle === "") {
      grandParent.setAttribute("class", "item");
      grandParent.removeAttribute("hide");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("confirmButton");
  submitForm.addEventListener("click", (event) => {
    event.preventDefault();
    addItem();
  });

  const cancelForm = document.getElementById("cancelButton");
  cancelForm.addEventListener("click", (event) => {
    event.preventDefault();
    removeField();
  });

  const filterButton = document.getElementById("searchButton");
  filterButton.addEventListener("click", (event) => {
    event.preventDefault();
    filterItem();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  appendItem();
});
