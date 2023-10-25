const progressCount = document.getElementById("progress-count");
const scoreCount = document.getElementById("score-count");
const countryName = document.getElementById("countryName");
const flag = document.getElementById("flag");
const takeHint = document.getElementById("takeHint");
const hint_content = document.getElementById("hint_content");
const answerInput = document.getElementById("question-input");
const correctAnswer = document.getElementById("correct-answer");
const answerResult = document.getElementById("answer-result");
const submitButton = document.getElementById("submit-button");
const nextButton = document.getElementById("next-button");
const endGameScreen = document.querySelector(".endgame");
const endGameModal = document.querySelector(".endgame__modal");
const endScore = document.getElementById("new-score");
const highScore = document.getElementById("high-score");
const highScoreText = document.querySelector(".endgame__high-score--text");
const playAgain = document.getElementById("play-again");

let countryList;
let allCountryList;
let correctAnswers = [];
let questionFlags = [];

let progress = 0,
  score = 0,
  streak = 0;


var xhttp = new XMLHttpRequest();
var respJSON = [];
xhttp.onreadystatechange = function (){
if(this.readyState == 4 && this.status == 200){
    resp = this.responseText;
    respJSON = JSON.parse(resp).filter((country) => country.capital);

    countryList = selectCountries(respJSON)
    
    correctAnswers = getAnswers(countryList);
    playQuiz();
}
}
xhttp.open("GET", "https://restcountries.com/v3.1/all", true)
xhttp.send();
  


//display countryList
function selectCountries(list) {
    let newList = [];
    while (newList.length < 5)
    {
      const newCountry = list[Math.floor(Math.random() * list.length)];
      newList.push(newCountry);
    }
    return newList;
}

// Define function to get list of correct answers from the 5 selected countries for each game
function getAnswers(list) {
  let answers = [];
  for (let country of list) {
    // create array of country flags for each question
    questionFlags.push(country.flags.png);
    // Create a names array of the official country name, the native country name, and alternative spellings
    let short_name = Object.keys(country.name.nativeName)[0]
    let names = [country.name.common.toLowerCase(), country.name.nativeName[short_name].common.toLowerCase()];
    for (let altName of country.altSpellings) {
      if (!names.includes(altName.toLowerCase())) names.push(altName.toLowerCase());
    }
    for (let translation of Object.values(country.translations)) {
      if (translation && !names.includes(translation.common.toLowerCase())) names.push(translation.common.toLowerCase());
    }
    //return an answer array of 5 subarrays in format:
    // [names answers, capital answer, population answer]
    answers.push([names, country.capital[0].toLowerCase()]);
  }
  return answers;
}



function playQuiz() {
  //Function to check answers array for next country and slice name, capital and population from next country
  if (!correctAnswers.length)
  {
    endGame();
  }
  else
  {
    let currentCountry = correctAnswers.pop();
    playCountry(currentCountry);
  }
}


// Function to take the 3 answers array for each country and start the round
function playCountry(answers) {
  getFlag(answers);
  getCountryNameAndHint(answers);

  // Store proper country name in title case for use during questions
  let currentCapitalCityName = answers[1]
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");
  nameQuestion(answers, currentCapitalCityName);
}

// function to retrieve and set the flag image
function getFlag(answers) {
  // get current country flag
  let flagImg = questionFlags.pop();
  // if the country is Nepal then set the flag object-fit to contain, to compensate for unique aspect ratio
  if (answers[0][0] === "nepal")
  {
    flag.setAttribute("style", "object-fit: contain; border: none; box-shadow: none; height: 100%");
  }
  else
  {
    // else set the object-fit to cover
    flag.setAttribute("style", "object-fit: cover; border: solid 0.2rem $color-white; box-shadow: 0 0 .8rem rgba(0,0,0,.5);");
    // Set a separate remove attribute instruction, as setting height: auto on flag element was causing issues on small desktop view
    flag.removeAttribute("style", "height: 100%");
  }
  // set current country flag as main image
  flag.setAttribute("src", flagImg);
  
}

// function to retrieve and set the flag image
function getCountryNameAndHint(answers) {

    countryName.textContent = answers[0][0]
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");

    let initialOfCapital = answers[1].slice(0,1).toUpperCase();
    
    hint.innerHTML = `Hint: initial is "<span class="hint">${initialOfCapital}</span>"`;
}


function nameQuestion(answers, name) {
  newQuestion();
  answerInput.focus();

  submitAnswer(answers[1], name);
  nextButton.addEventListener(
    "click",
    () => {
      streak = 0;
      playQuiz();
    },
    { once: true }
  );
}

//function to set up new Question on click of NEXT button
function newQuestion() {
  // clear result text
  answerResult.setAttribute("style", "opacity: 0");
  correctAnswer.setAttribute("style", "display: none");

  // clear inputted answer
  answerInput.value = "";
  
  //clear saved current user answer
  currentAnswer = "";

  //reset submit and next buttons
  submitButton.disabled = false;
  nextButton.disabled = true;

  // increment progress
  progress++;
  progressCount.textContent = progress.toString();
}


//  Submitting button Functionality
function submitAnswer(answer, displayAnswer) {


  // Add an eventListener to detect keypresses on answer Input
  answerInput.addEventListener("keydown", inputFunc);

  // Store functionality in separate function to avoid stacking answer checks
  // Source for this solution: Eloquent JavaScript, Chapter 14
  function inputFunc() {
    
    answerInput.addEventListener(
      "keyup",
      (e) => {
        // if key pressed = Enter, check code and remove eventListener to avoid stacking
        if (e.code === "Enter") {
          submitFunc();
        }
      },
      { once: true }
    );
  }

  // Submit button functionality
  submitButton.addEventListener("click", submitFunc);

  // Store another separate submitAnswer function that can be removed from *both* text input and submit button eventListeners, as only one of them will be used
  function submitFunc() {
    currentAnswer = answerInput.value.trim();
    isCorrect(answer);
    // remove all event Listeners
    answerInput.removeEventListener("keydown", inputFunc);
    submitButton.removeEventListener("click", submitFunc);
  }

  // Set correct answer text
  correctAnswer.innerHTML = `The correct answer is <span class="answer__answer--capital">${displayAnswer}</span>`;
}

// Function to check if current answer is correct
function isCorrect(answer) {
  let isCorrect;

  switch (true) {
    case "washington, d.c." && ["washington dc", "washington d.c.", "washington"].includes(currentAnswer.toLowerCase()):
    case "city of victoria" && ["victoria", "victoria city"].includes(currentAnswer.toLowerCase()):
    case "ulan bator" && currentAnswer.toLowerCase() === "ulaanbaatar":
      case (isCorrect = currentAnswer.toLowerCase() === removeAccent(answer)):
      isCorrect = true;
      break;
  }

  if (isCorrect)
  {
    //if answer is correct
    // style and change result text appropriately
    answerResult.textContent = "Correct!!!";
    answerResult.setAttribute("style", "color: #98bf00; opacity: 1;");
    // increment score
    score += 5;
    streak++;

    scoreCount.textContent = score;
  }
  else
  {
    // if answer is incorrect
    // change and style result text
    answerResult.textContent = "Wrong";
    answerResult.setAttribute("style", "color: #ff0000; opacity: 1; transform: translateY(0%)");
    
    // display correct answer
    correctAnswer.setAttribute("style", "color: #ff0000; display: block");
  }

  // disable submit button and enable next button to move to next question
  submitButton.disabled = true;
  nextButton.disabled = false;

  // set tab focus on nextButton to reduce needing tab or mouse to advance page
  nextButton.focus();
}

function removeAccent(str) {
  var map = {
    " ": "-",
    "": "'",
    a: "á|à|ã|â|å|À|Á|Ã|Â|Å",
    e: "é|è|ê|ē|É|È|Ê|Ē",
    i: "í|ì|î|Í|Ì|Î",
    o: "ó|ò|ô|õ|Ó|Ò|Ô|Õ",
    u: "ú|ù|û|ü|Ú|Ù|Û|Ü",
    c: "ç|Ç",
    n: "ñ|Ñ",
  };

  for (var pattern in map) {
    str = str.replace(new RegExp(map[pattern], "g"), pattern);
  }

  return str;
}


function endGame() {
  //run check score function
  scoreCheck();
  // Set current game rules for "play again" functionality
  playGameAgain();
  // Make endgame screen visible
  endGameScreen.setAttribute("style", "display: block; animation: endgame-screen-blur 2.5s ease both");
  endGameModal.setAttribute("style", "display: flex; animation: endgame-modal-appear 2.5s ease both");
}


// Function to check score against high score, and result text appropraitely
function scoreCheck() {
  // Display final score
  endScore.textContent = score;
  // CHeck previously saved high score
  let savedHighScore = localStorage.getItem("savedHighScore");
  // if there is none stored / new score is higher / current score is perfect
  if (savedHighScore === "null" || score > savedHighScore || score === 100)
  {
    // then save new score
    localStorage.setItem("savedHighScore", score);
    highScore.textContent = score;
    // change text to High Score or Perfect Score if 100 points
    highScoreText.textContent = score === 100 ? "Perfect Score!!!" : "New High Score!!";
    highScoreText.setAttribute("style", "display: block");
  }
  else
  {
    //otherwise, display previously saved high score
    highScore.textContent = savedHighScore;
  }
}

// Function to play the game again under the current Region / Difficulty settings
function playGameAgain() {
  playAgain.addEventListener(
    "click",
    () => {
      progress = 0;
      score = 0;
      scoreCount.textContent = score;
      selectedCountries = selectCountries(allCountryList);

      // Create array of correct answers
      correctAnswers = getAnswers(selectedCountries);

      //Initiatite Quiz Game Functions
      playQuiz();
      endGameScreen.setAttribute("style", "display: none");
    },
    { once: true }
  );
}


// toggle hint  
$(document).ready(function(){
  $(takeHint).click(function(){
    $(this).next(hint_content).slideToggle();
  });
});


