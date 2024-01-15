// Author: Brendan

// Constants for styling
const COLORS = '0123456789ABCDEF'; // Possible colors for buttons
const BUTTON_WIDTH = '10em'; // Width of buttons
const BUTTON_HEIGHT = '5em'; // Height of buttons
const BUTTON_MARGIN = '10px'; // Margin between buttons
const SHUFFLE_INTERVAL = 2000; // Time between shuffles in milliseconds

// Button class to represent each button on the game board
class Button {
  constructor(color, top, left, order, handler) {
    this.btn = this.createButton(color); // Create the button element
    this.setPOS(top, left); // Set the position of the button
    this.order = order; // stores the order of the button
    this.isClickable = false; // initialize the button to not be clickable at the start

    // add the button to the document body
    document.body.appendChild(this.btn);

    //adds the click event listener to the button and calls the handler function
    this.btn.addEventListener('click', () => {
      if (typeof handler === 'function') {
        handler(this); // call the handler function and pass the button as an argument
      }
    });
  }

  // Create a button element with the given color and styles
  createButton(color) {
    const button = document.createElement('button'); // create the button element
    button.style.backgroundColor = color; // set the background color
    button.style.width = BUTTON_WIDTH; // set the width
    button.style.height = BUTTON_HEIGHT; // set the height
    button.style.margin = BUTTON_MARGIN; // set the margin
    button.style.position = 'absolute'; // set the position to absolute so we can move it around
    return button;
  }

  // Set the top and left position of the button
  setPOS(top, left) {
    this.btn.style.top = top;
    this.btn.style.left = left;
  }
}

// Game class to manage the game logic
class Game {
  constructor(n) {
    this.n = n; // Number of buttons in the game set by the user
    this.buttons = []; // Array to store the buttons
    this.order = Array.from({ length: n }, (_, i) => i + 1); // Array to store the order of the buttons GPT
    this.playerChoice = []; // Array to store the player's choice
  }

  // Start the game by creating the buttons and shuffling them
  start() {
    let left = 0; // left position of the button
    let top = 0; // top position of the button
    let colorPicked = []; // array to store the colors picked for the buttons

    // Create buttons and distribute them evenly across the screen to see the order
    for (let i = 1; i <= this.n; i++) {
      // Makes sure the buttons don't go off the screen by wrapping them to the next line GPT
      if (left * 10 + 160 > window.innerWidth) {
        top += 6;
        left = 0;
      }

      // Gets a button color that hasn't been used yet
      const button = new Button(
        getColor(colorPicked), // get a color that hasn't been used yet
        top + 'em', // set the top position of the button
        left * 10 + 'px', // set the left position of the button
        i, // set the order of the button
        this.handleClick.bind(this) // bind the handleClick function to the game object
      );

      left += 15; // increment the left position of the button
      button.btn.innerHTML = i; // set the button text to the order of the button
      this.buttons.push(button); // add the button to the buttons array
    }

    // Shuffle the buttons to play the game
    this.shuffle();
  }

  // Function that is called when the player loses the game
  lose() {
    // Create the heading and reset button
    const heading = document.createElement('h1');
    heading.innerHTML = MESSAGES.correctOrder; // Set the heading text

    // Create the reset button
    const reset = document.createElement('input');
    reset.value = MESSAGES.playAgain; // Set the button text to play again
    reset.type = 'submit'; // Set the button type to submit
    reset.addEventListener('click', () => this.reset()); // Add the click event listener to the button

    // Show the order of the buttons and make them not clickable
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].isClickable = false; // make the buttons not clickable
      this.showOrder(this.buttons[i]); // show the order of the buttons
      this.buttons[i].btn.style.position = 'static'; // set the position of the button to static
      this.buttons[i].setStyles(this.buttons[i].orgTop, this.buttons[i].orgLeft); // set the top and left position of the button
    }

    // Add the heading and reset button to the document body
    document.body.appendChild(heading);
    document.body.appendChild(reset);
  }

  // Function that is called when the player clicks a button
  handleClick(button) {
    // Check if the button is clickable
    if (button.isClickable) {
      this.showOrder(button); // show the order of the button
      this.playerChoice.push(button.order); // add the button order to the player's choice array

      // Check if the player's choice is correct and gives them an alert
      setTimeout(() => {
        for (let i = 0; i < this.playerChoice.length; i++) {
          if (this.playerChoice[i] !== this.order[i]) {
            alert(MESSAGES.loser); // alert the player that they lost
            this.lose(); // call the lose function
            return;
          }
        }
        // Check if the player has won the game
        if (this.playerChoice.length === this.order.length) { // check if the player's choice is the same length as the order
          if (JSON.stringify(this.playerChoice) === JSON.stringify(this.order)) {
            alert(MESSAGES.winner); // alert the player that they won
            this.reset(); // reset the game
          } else {
            this.lose(); // call the lose function
          }
        }
      }, 100); // wait 100 milliseconds before checking the player's choice
    }
  }

  // Reset the game
  reset() {
    document.body.innerHTML = ''; // clear the document body
    menu();
  }

  // Hide the order of the buttons and make them clickable
  hideOrder() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].btn.innerHTML = ''; // hide the text for the order of the button
      this.buttons[i].isClickable = true; // make the button clickable
    }
  }

  // Show the order of the button
  showOrder(button) {
    button.btn.innerHTML = `${button.order}`;
  }

  // Shuffle the buttons 
  shuffle() {
    const shuffles = this.n; // number of times to shuffle the buttons
    let shuffleCount = 0;

    // Shuffle the buttons at the given interval and hide the order
    const shuffling = setInterval(() => {
      for (let j = 0; j < this.n; j++) {
        const button = this.buttons[j]; // get the button at the current index
        // Sets the top and left position of the button to a random position on the screen
        button.setPOS(
          Math.floor(Math.random() * (window.innerHeight - 96)) + 'px',
          Math.floor(Math.random() * (window.innerWidth - 160)) + 'px'
        );
      }

      // Increment the shuffle count and check if the buttons have been shuffled enough
      shuffleCount++;
      if (shuffleCount >= shuffles) {
        clearInterval(shuffling); // stop shuffling the buttons
        this.hideOrder(); // hide the order of the buttons
      }
    }, SHUFFLE_INTERVAL); // shuffle the buttons at the given interval
  }
}

// Function to create the menu
function menu() {
  document.body.innerHTML = ''; // clear the document body

  const formDiv = document.createElement('div'); // create the form div
  formDiv.id = 'form'; // set the id of the form div

  // Create the form template with the messages from the MESSAGES object
  // Sets the min and max values of the input to 3 and 7
  const template = `
    <h1>${MESSAGES.buttonNum}</h1>
    <input type="text" id="n" min="3" max="7">
    <input type="submit" value="${MESSAGES.go}">
  `;

  // Add the form template to the form div
  formDiv.innerHTML = template;

  // Add the click event listener to the submit button
  const submitButton = formDiv.querySelector('input[type="submit"]');
  submitButton.addEventListener('click', go);

  document.body.appendChild(formDiv); // add the form div to the document body
}

// Function to start the game when the user clicks the submit button
function go() {
  document.getElementById('form').style.display = 'none'; // Hide the starting form
  const n = parseInt(document.getElementById('n').value); // Get the number of buttons from the input
  // Check if the number of buttons is valid
  if (isNaN(n) || n < 3 || n > 7) {
    alert(MESSAGES.limits); // alert the user that the number of buttons is invalid
    menu(); // call the menu function
    return;
  }

  // Create the game and start it
  const game = new Game(n);
  game.start();
}

// Add the DOMContentLoaded event listener to the document
// this is called when the document is loaded
document.addEventListener('DOMContentLoaded', function () {
  menu();
});

// Function to get a random color
function getColor() {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += COLORS[Math.floor(Math.random() * 16)];
  }
  return color;
}
