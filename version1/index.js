import { API_KEY } from './key.js';

         // Requests to davinci costs 10% of the price of GPT-3.5 per token !!!!
const endpointURL = 'https://api.openai.com/v1/completions';


let recognization = new webkitSpeechRecognition(); // Créer un objet avec la fonction reconnaissance vocale

export const runSpeechRecog = async () => {
    
    
    document.getElementById("userInput").innerHTML = "Ecoute en cours ...";
    var userInput = document.getElementById('userInput');
    var action = document.getElementById('action');
    
    recognization.lang = 'fr-FR'; // Définir la langue 
    recognization.onstart = () => {  // Quand la reconnaissance vocale démarre
        action.innerHTML = "Ecoute en cours ...";
        console.log("Ecoute en cours ...");
    }
    recognization.onresult = async (e) => { // Quand la reconnaissance vocale a trouvé un résultat
        var transcript = e.results[0][0].transcript; // Récupère le résultat
        userInput.innerHTML = transcript; // Affiche le résultat
        action.innerHTML = "";
        await sendRequest(transcript); // Envoi la requête à l'API d'OpenAI
    }
    recognization.start(); // Démarre la reconnaissance vocale
}

document.addEventListener('keydown', function(event) { // Quand on appuie sur la touche espace on lance la reconnaissance vocale
    if (event.code === 'Space') {
        runSpeechRecog();
    }
  });

document.addEventListener('keyup', function(event) { // Quand on relache la touche espace on stop la reconnaissance vocale
    if (event.code === 'Space') {
        recognization.stop();
    }
});

let createdGameId = null;
let getPlayers = [];
let getpoints = [];
let gameHistory = [];

async function create_game(game, players,points) {
    console.log("create_game");
    console.log(game);
    console.log(players);
    createdGameId = game;
    getPlayers = players;
    getpoints = points;
    gameHistory.push({ players: getPlayers.slice(), points: getpoints.slice() });
    updateTable();
}
async function add_points(points, player) {
    console.log("add_points");
    console.log(points);
    console.log(player);

    const playerIndex = getPlayers.indexOf(player);

    getpoints[playerIndex] += points;

    gameHistory.push({ players: [player], points: [points] });
    updateTable();
}
function updateTable() {
   let table = document.querySelector('.nn');

   table.innerHTML = "";

   let nameRow = table.insertRow(-1);
   for (let i = 0; i < getPlayers.length; i++) {
       let nameCell = nameRow.insertCell(i);
       nameCell.textContent = getPlayers[i];
       nameCell.style.backgroundColor = "lightgray"; 
   }

   for (let i = 0; i < gameHistory.length; i++) {
       let newRow = table.insertRow(-1);
       for (let j = 0; j < getPlayers.length; j++) {
           let pointsCell = newRow.insertCell(j);
           const playerIndex = gameHistory[i].players.indexOf(getPlayers[j]);
           if (playerIndex !== -1) {
               pointsCell.textContent = gameHistory[i].points[playerIndex];
           } else {
               pointsCell.textContent = ""; 
           }

        }
   }

   let totalRow = table.insertRow(-1);
   for (let i = 0; i < getPlayers.length; i++) {
       let totalCell = totalRow.insertCell(i);
       let totalScore = gameHistory.reduce((acc, entry) => {
           const playerIndex = entry.players.indexOf(getPlayers[i]);
           if (playerIndex !== -1) {
               return acc + entry.points[playerIndex];
           } else {
               return acc;
           }
       }, 0);
       totalCell.textContent = totalScore;
       totalCell.style.backgroundColor = "lightgray"; 
   }
}

function updateConversationDisplay() {
    const chatHistoryElement = document.getElementById('chat-history');
    document.querySelectorAll('.user-message-container, .assistant-message-container').forEach(element => {
        element.style.display = 'none';});
        
    chatHistoryElement.innerHTML = '';

    conversationHistory.forEach(({ role, content }) => {
        if (role === 'user') {
            const userMessageContainer = document.createElement('div');
            userMessageContainer.classList.add('user-message-container');

            const userLabel = document.createElement('div');
            userLabel.classList.add('label');
            userLabel.textContent = 'Vous';

            const userMessage = document.createElement('div');
            userMessage.classList.add('user-message');
            userMessage.textContent = content;

            userMessageContainer.appendChild(userLabel);
            userMessageContainer.appendChild(userMessage);
            chatHistoryElement.appendChild(userMessageContainer);
        } else if (role === 'assistant') {
            const assistantMessageContainer = document.createElement('div');
            assistantMessageContainer.classList.add('assistant-message-container');

            const assistantLabel = document.createElement('div');
            assistantLabel.classList.add('label');
            assistantLabel.textContent = 'Jarvis';

            const assistantMessage = document.createElement('div');
            assistantMessage.classList.add('assistant-message');
            assistantMessage.textContent = content;

            assistantMessageContainer.appendChild(assistantLabel);
            assistantMessageContainer.appendChild(assistantMessage);
            chatHistoryElement.appendChild(assistantMessageContainer);
        }
    });
}





let conversationHistory = [];

function addToConversationHistory(role, content) {
    conversationHistory.push({role, content});
    updateConversationDisplay();
}
async function sendRequest(prompt) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiKey = 'sk-';
    const userInput = prompt;
    addToConversationHistory('system', "As an AI assistant a game has been created, you must follow these guidelines for all the rest of the request:\n" +
    "- Always do not create an other game after creating the first game that have the list of players "+  getPlayers + " \n" +
    "- Only invoke the `add_points` function for existing players in the list " + getPlayers + ".\n" +
    "- never add points without invoke the 'add_points' for players in the list " + getPlayers + ".\n" +
    "- Always reject the creation of a game or the invocation of the `create_game` function .\n" +
    "- Respond in French for all interactions. \n",+
    "- the players are "+ getPlayers +" there points successively are " + getpoints  );
        addToConversationHistory('user', userInput);
    
   let  payload = {
        model: 'gpt-3.5-turbo-0613',
        messages: conversationHistory,
        functions: [
            {
                name: "create_game",
                description: "Creer un tableau de joueurs pour un jeu",
                parameters: {
                    type: "object",
                    properties: {
                        game: {
                            type: "number",
                            description: "Générer un id pour le jeu",
                        },
                        players: {
                            type: "array",
                            description: "Les joueurs participant au jeu",
                            items: {
                                type: "string", 
                            }
                        },
                        points: {
                            type: "array",
                            description: "Les points de chaque joueur, chaque joueur a un nombre de points initialisé à 0",
                            items: {
                                type: "number",
                            }
                        }
                        
                    },
                    required: ["game", "players","points"],
                },
            },
            {
                name:"add_points",
                description:"ajouter des points à un joueur",
                parameters:{
                    type:"object",
                    properties:{
                        points:{
                            type:"number",
                            description:"les points à ajouter",
                        },
                        player:{
                            type:"string",
                            description:"le joueur à qui ajouter les points",
                        }
                    },
                    required:["points","player"],
                },
            }
        
        ],
        max_tokens: 500,
        temperature: 0.7
    };

    async function chatWithGpt() {
        console.log(payload.messages);
        console.log(payload);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(data);
        const choice = data.choices[0];
        if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'create_game' ) {
            const { game, players ,points} = JSON.parse(choice.message.function_call.arguments);
            await create_game(game, players,points); 
            payload.messages.push({
                role: "function",
                name: "create_game",
                content: JSON.stringify({ game: game ,players : players , points : getpoints})
            } );
           
            return chatWithGpt();
        } else if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'game_points' ) {
            const { points } = JSON.parse(choice.message.function_call.arguments); // Déstructuration correcte des arguments
            await game_points(points,getPlayers); // Appel correct de la fonction game_points
            payload.messages.push({
                role: "function",
                name: "game_points",
                content: JSON.stringify({ points: points , players : getPlayers})
            });
            return chatWithGpt();
        } else if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'add_points' ){
            const { points, player } = JSON.parse(choice.message.function_call.arguments); // Déstructuration correcte des arguments
            await add_points(points, player); // Appel correct de la fonction add_points
            payload.messages.push({
                role: "function",
                name: "add_points",
                content: JSON.stringify({ points: points , player : player})
            });
            return chatWithGpt();
        }
        else {
            const outputElement = document.getElementById('output');
            outputElement.textContent = data.choices[0].message.content;
            addToConversationHistory('assistant', data.choices[0].message.content);
             }
    }
    
        try {
            chatWithGpt();
        } catch (error) {
            console.error(error);
        } 
}