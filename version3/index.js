let mediaRecorder;
let audioChunks = [];
let recognization = new webkitSpeechRecognition(); 
let spaceKeyPressed = false;
var recognition = new window.webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'fr-FR';

// Démarrer la reconnaissance
recognition.start();
console.log("start");
DitLaVoix();

function DitLaVoix() {
    // Écouter l'événement 'result'
    recognition.addEventListener('result', function(event) {
        // Parcourir tous les résultats actuels
        for (var i = event.resultIndex; i < event.results.length; i++) {
            console.log(event.results[i][0].transcript.trim().includes ('Jarvis'));
            // Si la phrase est finie
            if (event.results[i].isFinal) {
                // Si la phrase est "dit la voix"
                if (event.results[i][0].transcript.trim().includes ('Jarvis')) {
                    
                document.getElementById('speechButton').innerHTML = '<i class="fas fa-microphone"></i>';
                document.getElementById('speechButton').style.backgroundColor = "red";
                 const synth = window.speechSynthesis;
                const utterance = new SpeechSynthesisUtterance("Oui");
                synth.speak(utterance);

                    // Arrêter la reconnaissance
                    console.log("start dit la voix");
                    //recognition.stop();

                    // Lancer la fonction de reconnaissance vocale
                    startRecording();
                }
                else if (event.results[i][0].transcript.trim().includes ('Jarvis') == false) {
                    document.getElementById('speechButton').innerHTML = '<i class="fas fa-microphone-alt-slash"></i>';
                    document.getElementById('speechButton').style.backgroundColor = "blue";
                }
                stopRecording();
            }
        }
    });
    recognition.onend = function() {
        recognition.start();
    };
    
    
    }


function startRecordingOnSpace(event) {
    if (event.keyCode === 32 && !spaceKeyPressed) {
        spaceKeyPressed = true;
        startRecording();
    }
}

function stopRecordingOnSpace(event) {
    if (event.keyCode === 32) {
        spaceKeyPressed = false;
        stopRecording();
    }
}
async function startRecording() {
    console.log("Reconnaisance start");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        invokeWhisperAPI(audioBlob);
    };

    mediaRecorder.start();
    
    

}
async function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        audioChunks = [];
        recognition.continuous = true;  
    }

    
}




async function invokeWhisperAPI(audioBlob) {
    const API_URL = 'https://api.openai.com/v1/audio/transcriptions';
    let formData = new FormData();

    // Add the audio file to the form data
    formData.append('file', audioBlob);

    // Add the model name to the form data
    formData.append('model', 'whisper-1');

    fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': 'Bearer sk-'  
        }
    })
    .then(response => response.json())
    .then(async data => {
        document.getElementById('output').innerText = data.text;
        await sendRequest(data.text);
    })
    .catch(error => {
        console.error('Error:', error);
    });

   
}
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
async function add_points(points, players) {
    console.log("add_points");
    console.log(getPlayers);
    console.log(getpoints);

    console.log(points);
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const point = points[i];

        // Trouver la dernière entrée de l'historique de jeu pour ce joueur
        const playerIndex = getPlayers.indexOf(player);
        getpoints[playerIndex] += point;

        let lastEntryIndex = -1;
        for (let i = gameHistory.length - 1; i >= 0; i--) {
            if (gameHistory[i].players.includes(player)) {
                lastEntryIndex = i;
                break;
            }
        }

        // Si aucune entrée n'existe pour ce joueur, ajouter les points à la première ligne
        if (lastEntryIndex === -1) {
            gameHistory.unshift({
                players: [player],
                points: [point]
            });
        } else {
            // Sinon, ajouter les points à la ligne suivante
            const nextEntryIndex = lastEntryIndex + 1;
            if (gameHistory[nextEntryIndex]) {
                gameHistory[nextEntryIndex].players.push(player);
                gameHistory[nextEntryIndex].points.push(point);
            } else {
                gameHistory.push({
                    players: [player],
                    points: [point]
                });
            }
        }
    }

    updateTable();
}

async function delete_player(player) {
    console.log("delete_player");
    console.log(player);

    const playerIndex = getPlayers.indexOf(player);

    getPlayers.splice(playerIndex, 1);
    getpoints.splice(playerIndex, 1);

    // Supprimer le joueur et ses points de chaque entrée de l'historique de jeu
    for (let entry of gameHistory) {
        const playerIndexInEntry = entry.players.indexOf(player);
        if (playerIndexInEntry !== -1) {
            entry.players.splice(playerIndexInEntry, 1);
            entry.points.splice(playerIndexInEntry, 1);
        }
    }

    updateTable();

}
async function repeat_game(players,points) {
    console.log("repeat_game");
    getPlayers = players;
    getpoints = points;
    console.log(getPlayers);
    console.log(getpoints);
    gameHistory.push({ players: getPlayers.slice(), points: getpoints.slice() });

    // Supprimer tous le tableau
    for (let i = gameHistory.length - 1; i >= 0; i--) {
        gameHistory.splice(i, 1);
    }
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
    const apiKey = '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';
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
                description: "Create a new game with a unique ID. Conditions: Only create a game for the first request . if the conditions is true Respond: un jeu exist deja .",
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
                description:"ajouter des points à un joueur. Conditions: Ne pas ajouter de points à un joueur qui n'existe pas dans la liste des joueurs du jeu. Respond: les points (mentione les points) ont été ajoutés au joueur.",
                parameters:{
                    type:"object",
                    properties:{
                        points :{
                        type: "array",
                        description: "les points à ajouter au joueurs",
                        items: {
                                type: "number", 
                        },
                    },
                        players:{
                            type:"array",
                            description:"les joueurs a qui ajouter les points",
                            items:{
                                type:"string",
                            }
                        }
                    },
                    required:["points","players"],
                },
            },
            {
                name:"delete_player",
                description:"supprimer un joueur",
                parameters:{
                    type:"object",
                    properties:{
                        player:{
                            type:"string",
                            description:"le nom du joueur à supprimer",
                        }
                    },
                    required:["player"],
                }
            },
            {
                name:"repeat_game",
                description:"répéter le jeu",
                parameters:{
                    type:"object",
                    properties:{
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
                    required:["players", "points"],                }
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
            const { points, players } = JSON.parse(choice.message.function_call.arguments); 
            await add_points(points, players); 
            payload.messages.push({
                role: "function",
                name: "add_points",
                content: JSON.stringify({ points: points , players : players})
            });
            return chatWithGpt();
        } else if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'delete_player' ){
            const { player } = JSON.parse(choice.message.function_call.arguments); 
            await delete_player(player); 
            payload.messages.push({
                role: "function",
                name: "delete_player",
                content: JSON.stringify({ player : player})
            });
            return chatWithGpt();
        }  else if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'repeat_game' ){
            const { players,points } = JSON.parse(choice.message.function_call.arguments);
            await repeat_game(players,points); 
            payload.messages.push({
                role: "function",
                name: "repeat_game",
                content: JSON.stringify({ players : players , points : getpoints})
            });
            return chatWithGpt();
        }
        else {
            const outputElement = document.getElementById('output');
            outputElement.textContent = data.choices[0].message.content;
            addToConversationHistory('assistant', data.choices[0].message.content);
            speakResponse(data.choices[0].message.content);
             }
    }
    
        try {
            chatWithGpt();
        } catch (error) {
            console.error(error);
        } 

function speakResponse(text,language = 'fr-FR') {
    const synth = window.speechSynthesis;

    // Cancel any previous speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;  // Spécifiez la langue ici également
    const voices = synth.getVoices();
    if (voices.length > 0) {
        // You can select a specific voice if available
        // Adjust other settings
        utterance.volume = 1; // Volume (0 to 1)
        utterance.rate = 1;   // Speaking rate (0.1 to 10)
        utterance.pitch = 1;  // Pitch (0 to 2)
        utterance.lang = 'fr-FR';  // Language code
    }

    // Speak the text
    synth.speak(utterance);
}
}

