const rollerItems = document.querySelector("#roller-items");
const arrowLeft = document.querySelector("#arrow-left");
const arrowRight = document.querySelector("#arrow-right");
const rollerThumbs = document.querySelector("#roller-thumbs");

const searchBar = document.querySelector("#store-search-form");
const searchBtn = document.querySelector("#store-search-button");

const gamesTitle = document.querySelector("#games-title");
const genresLoader = document.querySelector("#genres-loader-wrapper"); 
const gamesLoader = document.querySelector("#games-loader-wrapper");

// GET ALL TAGS
async function getAllTags() {
  try {
    const url = `https://steam-api-mass.onrender.com/steamspy-tags?limit=1000`;
    const result = await fetch(url);
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("error", error);
  }
}


// API ALL GENRES
async function getAllGenres() {
  try {
    const url = `https://steam-api-mass.onrender.com/genres?limit=1000`
    const result = await fetch(url);
    const data = await result.json();
    // console.log("data",data);
    return data;

  } catch (error) {
    console.log("error",error);
  }
}

// Function that generate random background colors;

function randomBgColor() {
  var x = Math.floor(Math.random() * 100);
  var y = Math.floor(Math.random() * 100);
  var z = Math.floor(Math.random() * 100);
  var bgColor = `rgb(${x},${y},${z})`;
  return bgColor;
}

randomBgColor();

async function renderGenres() {
  try {
    // Get HTML of the Roller Items section
    const rollerItems = document.querySelector("#roller-items")
    // Clear HTML of the Category-roller section
    rollerItems.innerHTML = ""
    
    // Loader appear
    genresLoader.style.display = 'block';
    
    // Await data
    const data = await getAllGenres();
    
    // Hider loader
    genresLoader.style.display = 'none';
    
    // Data part

    // 2. divide categories into list of lists of 4 categories
    let dataListOfFour = [];
    let subListOfFour = [];
    for (let i = 0; i < data.data.length; i++) {
      subListOfFour.push(data.data[i]);
      if (subListOfFour.length % 4 === 0) {
        dataListOfFour.push(subListOfFour);
        subListOfFour = [];
      }

      // MISSING THE LAST UNEVEN CATEGORIES
      // if ((i >= data.data.length) & (subListOfFour.length % 4 !== 0)) {
      //   dataListOfFour.push(subListOfFour);
      // }
    }

    // console.log(dataListOfFour);
    // 3. append child
    for (let i = 0; i < dataListOfFour.length; i++) {
      const row = document.createElement("div");
      row.setAttribute("class", "roller-children-row roller-row-hidden");
      
      for (let a = 0; a < 4; a++) {
        const categoryContainer = document.createElement("div");
        categoryContainer.setAttribute("class", "category-container");
        categoryContainer.innerHTML = `<div class="category-name">${dataListOfFour[i][a].name}</div>
        <div class="category-quantity">Games - ${dataListOfFour[i][a].count}</div>`;
        categoryContainer.style.backgroundColor = randomBgColor();
        row.appendChild(categoryContainer);
      }
      
      rollerItems.appendChild(row);

      // Remove Class Hidden for first row
      rollerItems.children[0].classList.remove("roller-row-hidden");
    }

    // Run Roller Thumb function
    setUpRollerThumbs();
    
    // Run addGenreSelectionOnClick
    addGenreSelectionOnClick();
  } catch (error) {
    console.log("error", error);
  }
}

// Moving Categories arrow
function moveHiddenRowClass(direction) {
  const rollerItemsChildren = rollerItems.children
  
  // Find index of child element of Roller-Nav that does not contain class Hidden
  let nonHiddenChildIndex;
  for (let i = 0; i < rollerItemsChildren.length; i++) {
    if (!rollerItemsChildren[i].classList.contains("roller-row-hidden")) {
      nonHiddenChildIndex = i
    }
  }
  // Add Class Hidden to that child
  rollerItemsChildren[nonHiddenChildIndex].classList.add("roller-row-hidden");

  // If direction === "forward" => Remove Class Hidden of the next child
  // Else if direction === "backward" => Remove Class Hidden of the previous child
  if (direction === "forward") {
    if (nonHiddenChildIndex === rollerItemsChildren.length-1) {
      rollerItemsChildren[0].classList.remove("roller-row-hidden");
    } else {
      rollerItemsChildren[nonHiddenChildIndex+1].classList.remove("roller-row-hidden"); 
    }

  } else if (direction === "backward") {
    if (nonHiddenChildIndex === 0) {
      rollerItemsChildren[rollerItemsChildren.length-1].classList.remove("roller-row-hidden");
    } else {
      rollerItemsChildren[nonHiddenChildIndex-1].classList.remove("roller-row-hidden")
    }
  }  
}

// Change Category row with arrow button
arrowLeft.addEventListener("click", () => {
  moveHiddenRowClass("backward")
})

arrowRight.addEventListener("click", () => {
  moveHiddenRowClass("forward")
})

// ROLLER THUMBS AREA

function moveHiddenRowClassThumb(index) {
  const rollerItemsChildren = rollerItems.childNodes
  // Check if selected index has Hidden Class
  if (rollerItemsChildren[index].classList.contains("roller-row-hidden")) {
    // Yes =>
    // 1. Find the row that does not have hidden class
    let nonHiddenChildIndex;
    for (let i = 0; i < rollerItemsChildren.length; i++) {
      if (!rollerItemsChildren[i].classList.contains("roller-row-hidden")) {
      nonHiddenChildIndex = i
      }
    }
    // 2. Add Hidden class to that row
    rollerItemsChildren[nonHiddenChildIndex].classList.add("roller-row-hidden");
    
    // 3. Remove Hidden Class from selected row
    rollerItemsChildren[index].classList.remove("roller-row-hidden");    
  } 
}

// Function that set up Thumbs and functionality
const setUpRollerThumbs = () => {
  const rollerItemsChildren = rollerItems.childNodes
  rollerThumbs.innerHTML = ""
  // Count how many Roller-children-row in Roller items
  // Add same number of divs under Roller-thumbs
  for (let i = 0; i < rollerItemsChildren.length; i++) {
    const x = document.createElement("div")
    x.setAttribute("class","")
    rollerThumbs.appendChild(x)
  }

  // Connect div order matching row order by index  
  for (let i = 0; i < rollerThumbs.children.length; i++) {
    rollerThumbs.children[i].addEventListener("click", () => {
      moveHiddenRowClassThumb(i);
    })    
  }
}

// GET ALL GAMES
async function getAllGames() {
  try {
    let queryString = "";
    const searchValue = searchBar.value;

    // Check if input same as any genre? => return games with the genre
    const allGenreNames = await saveAllGenreNames();
    // check if input same as any tag? => return games with the tag
    const allTagNames = await saveAllTagNames();
    // else, => return games with name containing the input

    if (allGenreNames.includes(searchValue.toLowerCase())) {
      queryString += `&genres=${searchValue.toLowerCase()}`;
    } else if (allTagNames.includes(searchValue.toLowerCase())) {
      queryString += `&steamspy_tags=${searchValue.toLowerCase()}`;
    } else if (searchValue === "") {
      queryString = "";
    } else {
      queryString += `&q=${searchValue.toLowerCase()}`;
    }

    const url = `https://steam-api-mass.onrender.com/games?limit=102${queryString}`;

    // const url = `https://steam-api-mass.onrender.com/games?limit=51&genres=nudity`;
    const result = await fetch(url);
    const data = await result.json();
    return data;
  } catch (error) {
    console.log("error", error);
  }
}

// getAllGames();

// RENDER ALL GAMES

async function renderGames() {
  try {
    // Get #games section
    const games = document.querySelector("#games");
    // clear HTML
    games.innerHTML = "";
    
    // Loader appear
    gamesLoader.style.display = 'block';

    // Await for data to load
    const data = await getAllGames();
    
    // Hide loader
    gamesLoader.style.display = 'none'

    // Add new HTML children
    data.data.forEach((element) => {
      const x = document.createElement("div");
      x.setAttribute("class","game");
      x.innerHTML = `<div class="game-link game-cover">
      <img src="${element.header_image}" alt="">
      </div>
      <div class="game-price">$${element.price}</div>
      <div class="hover-screen">
        <div class="hover-game-basic-info">
          <div class="hover-game-name hover-game-item">${element.name}</div>
          <div class="hover-game-tags hover-game-item">
          </div>
          <div class="hover-game-ratings hover-game-item">
            <div class="positive-reviews game-rating-item">👍: ${element.positive_ratings}</div>
            <div class="negative-reviews game-rating-item">👎: ${element.negative_ratings}</div>
          </div>
        </div>
      </div>`;

      const gameTags = x.querySelector(".hover-screen .hover-game-basic-info .hover-game-tags");
      for (let i = 0; i < element.steamspy_tags.length; i++) {
        const y = document.createElement("div");
        y.setAttribute("class", "game-tag");
        y.textContent = element.steamspy_tags[i];
        gameTags.appendChild(y);
      }

      games.appendChild(x);
      x.addEventListener("click", () => {
        const appId = element["appid"];
        renderGameDetails(appId);
      })
    })

  } catch (error) {
    console.log("error",error);
  }
}

// renderGames();

// async function that returns list of genres
async function saveAllGenreNames() {
  try {
    const data = await getAllGenres();
    let listOfGenres = [];
    for (let i = 0; i < data.data.length; i++) {
      listOfGenres.push(data.data[i].name);
    }
    return listOfGenres;
  } catch (error) {
    console.log("error",error);
  }
}

async function saveAllTagNames() {
  try {
    const data = await getAllTags();
    let listOfTags = [];
    data.data.forEach((element) => {
      listOfTags.push(element.name);
    })
    return listOfTags;
  } catch (error) {
    console.log("error",error);
  }
}

// RELOAD PAGE | HOME button - click on STEAM
const homeButton = document.querySelector("#header-nav-container div");
homeButton.addEventListener('click',function(){location.reload()});

// SEARCH GAME FUNCTION
async function searchGames() {
  try {
    await renderGames();  
  } catch (error) {
    console.log("error",error);
  }
}

// Event Listener for search Button
searchBtn.addEventListener("click", () => {
  searchGames();
  gamesTitle.innerHTML = `Search results for: ${searchBar.value}`;
})

// Event Listener for pressing Enter on search bar
searchBar.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    // Trigger the button element with a click
    searchBtn.click();
  }
});

//  GENRE SELECT FEATURE
const addGenreSelectionOnClick = () => {
  const allCategories = document.querySelectorAll("#roller-items .category-container");
  for (let i = 0; i < allCategories.length; i++)  {
    allCategories[i].addEventListener("click", () => {
      genreName = allCategories[i].children[0].innerHTML
      // console.log(genreName)
      searchBar.value = genreName;
      searchBtn.click();
      gamesTitle.innerHTML = `Genre: ${genreName.toUpperCase()}`;
    })
  }
}

// LOADING GAME DETAILS
async function getGameDetails(appId) {
  const url = `https://steam-api-mass.onrender.com/single-game/${appId}`;
  const result = await fetch(url);
  const data = await result.json();
  return data;
}

// RENDER GAME DETAILS
async function renderGameDetails(appId) {
  try {
    // Clear Game title
    const gamesTitle = document.querySelector("#games-title")
    gamesTitle.innerHTML = ""

    const games = document.querySelector("#games");
  
    // Clear innerHTML of Games area
    games.innerHTML = ""

    // Unhide Game Loader
    gamesLoader.style.display = 'block';
    
    // get Game Details data
    const data = await getGameDetails(appId);

    // Update Game title - Game Name
    gamesTitle.innerHTML = data.data.name;

    // Hide Game Loader
    gamesLoader.style.display = 'none';

    // Load game details to HTML
    games.innerHTML = `<div id="showing-game-details" class="showing-game-details">
      <div class="img-details game-details-item">
        <img class ="game-img img-details-sub" src="${data.data.header_image}" alt="${data.data.name}">
        <div class="game-details img-details-sub">
          <div class="game-description game-details-item">
            ${data.data.description}
          </div>
          <div class="game-information game-details-item">
            <p><span>RELEASE DATE:</span><span>${data.data.release_date}</span></p>
            <p><span>POSITIVE REVIEWS:</span><span>${data.data.positive_ratings}</span></p>
            <p><span>NEGATIVE REVIEWS</span><span>${data.data.negative_ratings}</span></p>
            <p><span>DEVELOPER:</span><span class="developer-list"></span></p>
            <p><span>PRICE:</span><span class="game-detail-price">$${data.data.price}</span></p>
          </div>
        </div>
      </div>
      <div class="tags-container game-details-item">
        Popular user-defined tags for this product:
        <div class="tags">
        </div>
      </div>
    </div>`

    // Add Developers
    const developerInfo = games.querySelector(".img-details .game-information .developer-list")
    for (let i = 0; i < data.data.developer.length; i++) {
      const developerName = data.data.developer[i];
      const developerQuery = developerName.split(" ").join("%20");

      const x = document.createElement("div");
      x.innerHTML = `<a href="https://store.steampowered.com/search/?developer=${developerQuery}">${developerName}</a>`
      developerInfo.appendChild(x);
    }

    // Add tags;
    const tagList = [];
    for (let i = 0; i < data.data.steamspy_tags.length; i++) {
      if (!(tagList.includes(data.data.steamspy_tags.length[i]))) {
        tagList.push(data.data.steamspy_tags[i]);
      }
    }
    
    for (let i = 0; i < data.data.genres.length; i++) {
      if (!(tagList.includes(data.data.genres[i]))) {
        tagList.push(data.data.genres[i]);
      }
    }

    // Capitalize first word of each Tag and add to HTML Tag List
    const tagListHtml = games.querySelector(".tags-container .tags")
    for (let i = 0; i < tagList.length; i++) {
      const tag = tagList[i];
      const words = tag.split(" ");

      for (let a = 0; a < words.length; a++) {
        words[a] = words[a][0].toUpperCase() + words[a].substr(1);
      }

      const tagCapitalize = words.join(" ");
      const tagQuery = words.join("%20")

      // Add Tag to tag list
      const x = document.createElement("div");
      x.setAttribute("class","tag");
      x.innerHTML = `<a href="https://store.steampowered.com/tags/en/${tagQuery}/?snr=1_5_9__409">${tagCapitalize}</a>`
      tagListHtml.appendChild(x);
    } 
    // console.log(tagList);
  } catch (error) {
    console.log("error",error);
  }
}

renderGenres();
renderGames();