// src/app.js
// ============================================================================
// Author: José Luis Chafardet G.
// Email: jose.chafardet@icloud.com
// Github: https://github.com/jlchafardet
//
// File Name: app.js
// Description: Mad Libs terminal game
// Created: Thursday, 19 October 2023
// Last Modified: Thursday, 19 October 2023
// ============================================================================

import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk'; // Import chalk for colored text

// Load stories from JSON file
let storiesData;
try {
    storiesData = JSON.parse(fs.readFileSync('./assets/stories.json', 'utf-8')); // Read and parse the JSON file containing stories
} catch (error) {
    console.error(chalk.red("Error loading stories data. Please check the JSON file format.")); // Error message for JSON loading
    process.exit(1); // Exit the application if stories cannot be loaded
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to wrap text to a specified width
// Takes a string and a width, returns the wrapped text
function wrapText(text, width) {
    const words = text.split(' '); // Split the text into words
    let wrappedText = ''; // Initialize the wrapped text
    let currentLine = ''; // Initialize the current line

    words.forEach(word => {
        // Check if adding the next word exceeds the width
        if ((currentLine + word).length > width) {
            wrappedText += currentLine.trim() + '\n'; // Add the current line to wrapped text
            currentLine = word + ' '; // Start a new line with the current word
        } else {
            currentLine += word + ' '; // Add the word to the current line
        }
    });

    wrappedText += currentLine.trim(); // Add any remaining text
    return wrappedText; // Return the wrapped text
}

// Function to print the game title in a box
// Takes a title string and prints it centered in a decorative box
function printTitle(title) {
    const width = 75; // Set the width for the title box
    const border = '═'.repeat(width - 2); // Create the border line
    const titleLength = title.length; // Get the length of the title
    const padding = Math.max(0, (width - 2 - titleLength) / 2); // Calculate padding for centering

    // Create the title line with appropriate padding
    const titleLine = chalk.blue(`║${' '.repeat(padding)}${title}${' '.repeat(padding + (width - 2 - titleLength) % 2)}║`); // Center the title with borders

    console.log(chalk.blue(`╔${border}╗`)); // Print the top border
    console.log(titleLine); // Print the title line
    console.log(chalk.blue(`╚${border}╝`)); // Print the bottom border
    console.log(); // Print an empty line for spacing
}

// Function to display themes and prompt user for selection
// Displays available themes and asks the user to select one
function displayThemes() {
    printTitle("Mad Libs Terminal Game"); // Print the game title
    console.log(chalk.white(wrapText("Available Themes:", 75))); // Print available themes message
    const themes = Object.keys(storiesData.themes); // Get the list of themes from the stories data
    themes.forEach((theme, index) => {
        console.log(chalk.red(`${index + 1}. ${chalk.blue(theme)}`)); // Print themes in red with blue titles
    });
    console.log(); // Print an empty line for spacing

    // Set the prompt text to white and ask for user input
    rl.question(chalk.white("Please select a theme by entering the corresponding number: "), (answer) => {
        const selectedThemeIndex = parseInt(answer) - 1; // Convert user input to an index
        if (isNaN(selectedThemeIndex) || selectedThemeIndex < 0 || selectedThemeIndex >= themes.length) {
            console.log(chalk.red("Invalid selection. Please enter a valid number corresponding to a theme.")); // Error message for invalid input
            displayThemes(); // Re-display themes for selection
        } else {
            const selectedTheme = themes[selectedThemeIndex]; // Get the selected theme
            selectRandomStory(selectedTheme); // Proceed to select a random story
        }
    });
}

// Function to select a random story from the chosen theme
// Takes a theme and selects a random story from it
function selectRandomStory(theme) {
    const stories = storiesData.themes[theme].stories; // Get stories for the selected theme
    const randomIndex = Math.floor(Math.random() * stories.length); // Generate a random index
    const selectedStory = stories[randomIndex]; // Select a random story
    promptForInputs(selectedStory); // Prompt user for inputs based on the selected story
}

// Function to prompt user for inputs based on placeholders
// Takes a story and asks the user for inputs to fill in the placeholders
function promptForInputs(story) {
    const inputs = []; // Initialize an array to store user inputs
    const placeholders = story.placeholders; // Get the placeholders from the story

    // Recursive function to ask for each input
    function askForInput(index) {
        if (index < placeholders.length) {
            rl.question(`${placeholders[index].prompt}: `, (input) => {
                if (input.trim() === "") {
                    console.log(chalk.red("Input cannot be empty. Please provide a valid input.")); // Error message for empty input
                    askForInput(index); // Ask for the same input again
                } else {
                    inputs.push(input); // Store the user input
                    askForInput(index + 1); // Ask for the next input
                }
            });
        } else {
            displayCompletedStory(story, inputs); // Once all inputs are collected, display the completed story
        }
    }

    askForInput(0); // Start asking for inputs from the first placeholder
}

// Function to display the completed story
// Takes a story and user inputs, and displays the final story
function displayCompletedStory(story, inputs) {
    // Replace placeholders in the story with user inputs, highlighting them in green
    let completedStory = story.story.join(' ').replace(/___/g, () => chalk.green(inputs.shift())); 
    console.log(); // Print an empty line for spacing
    console.log(chalk.yellow("Here is your completed story:")); // Print completed story header
    console.log(); // Print an empty line for spacing
    printTitle(story.title); // Print the story title in a box
    console.log(); // Print an empty line for spacing
    console.log(wrapText(completedStory, 75)); // Wrap the completed story text to 75 characters
    rl.close(); // Close the readline interface
}

// Start the game by displaying themes
displayThemes();