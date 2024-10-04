// src/app.js
// ============================================================================
// Author: José Luis Chafardet G.
// Email: jose.chafardet@icloud.com
// Github: https://github.com/jlchafardet
//
// File Name: app.js
// Description: Mad Libs terminal game
// Created: ${new Date().toISOString()}
// Last Modified: ${new Date().toISOString()}
// ============================================================================

const fs = require('fs');
const readline = require('readline');

// Load stories from JSON file
const storiesData = JSON.parse(fs.readFileSync('./assets/stories.json', 'utf-8'));

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to display themes and prompt user for selection
function displayThemes() {
    console.log("Welcome to the Mad Libs Game!");
    console.log("Available Themes:");
    const themes = Object.keys(storiesData.themes);
    themes.forEach((theme, index) => {
        console.log(`${index + 1}. ${theme}`);
    });
    rl.question("Please select a theme by entering the corresponding number: ", (answer) => {
        const selectedThemeIndex = parseInt(answer) - 1;
        if (selectedThemeIndex >= 0 && selectedThemeIndex < themes.length) {
            const selectedTheme = themes[selectedThemeIndex];
            selectRandomStory(selectedTheme);
        } else {
            console.log("Invalid selection. Please try again.");
            displayThemes();
        }
    });
}

// Function to select a random story from the chosen theme
function selectRandomStory(theme) {
    const stories = storiesData.themes[theme].stories;
    const randomIndex = Math.floor(Math.random() * stories.length);
    const selectedStory = stories[randomIndex];
    promptForInputs(selectedStory);
}

// Function to prompt user for inputs based on placeholders
function promptForInputs(story) {
    const inputs = [];
    const placeholders = story.placeholders;

    function askForInput(index) {
        if (index < placeholders.length) {
            rl.question(`${placeholders[index].prompt}: `, (input) => {
                inputs.push(input);
                askForInput(index + 1);
            });
        } else {
            displayCompletedStory(story, inputs);
        }
    }

    askForInput(0);
}

// Function to display the completed story
function displayCompletedStory(story, inputs) {
    let completedStory = story.story.join(' ').replace(/___/g, () => inputs.shift());
    console.log("\nHere is your completed story:\n");
    console.log(completedStory);
    rl.close();
}

// Start the game by displaying themes
displayThemes();
