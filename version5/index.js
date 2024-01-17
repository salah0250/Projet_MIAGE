let mediaRecorder;
let audioChunks = [];
let recognization = new webkitSpeechRecognition(); 
let spaceKeyPressed = false;
var recognition = new window.webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'fr-FR';
let useSpaceRecognition = false; // Variable to track the current state



var restartButton = document.getElementById("restartButton");

restartButton.addEventListener('click', function() {
    // Appeler la fonction pour redémarrer le jeu
    sendRequest("recommencer la partie");
});
function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    if (menu.style.display === 'none') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}



function DitLaVoix() {
    recognition.addEventListener('result', function (event) {
        for (var i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            const confidence = event.results[i][0].confidence;
           
            const confidenceThreshold = 0.7;
            if (event.results[i].isFinal && confidence >= confidenceThreshold && transcript.includes('Jarvis') && !useSpaceRecognition) {
                const words = transcript.split(' ');
                const indexOfJarvis = words.indexOf('Jarvis');
                document.getElementById('speechButton').innerHTML = '<i class="fas fa-microphone"></i>';
                document.getElementById('speechButton').style.backgroundColor = "red";
                if (indexOfJarvis !== -1 && indexOfJarvis < words.length - 1) {
                    // Extraire les mots après "Jarvis"
                    const command = words.slice(indexOfJarvis + 1).join(' ');
                    console.log("Commande détectée:", command);
                    if(sendRequest(command))
                    {
                        document.getElementById('speechButton').innerHTML = '<i class="fas fa-microphone"></i>';
                        document.getElementById('speechButton').style.backgroundColor = "black";                    }
                    
                }
                
            }
           
        }
    });

    recognition.onend = function () {
        recognition.start();
    };
}





function startRecordingOnSpace(event) {
    if (useSpaceRecognition && event.keyCode === 32 && !spaceKeyPressed) {
        spaceKeyPressed = true;
        startRecording();
    }
}
// quand je lache la touche espace le micro s'arrete
function stopRecordingOnSpace(event) {
    
    if (useSpaceRecognition && event.keyCode === 32) {
        spaceKeyPressed = false;
        stopRecording();
        recognition.stop();

    }
}
function toggleRecognition() {
    const button = document.getElementById('toggleButton'); // Remplacez '#your-button-id' par l'ID de votre bouton
    useSpaceRecognition = !useSpaceRecognition;
    if (useSpaceRecognition) {
        // Enable space key recognition
        window.addEventListener('keydown', startRecordingOnSpace);
        window.addEventListener('keyup', stopRecordingOnSpace);
        console.log("Space recognition enabled");;
        button.textContent = 'Active Jarvis';
        button.style.backgroundColor = 'green';
        recognition.stop();
    } else {
        // Disable space key recognition
        window.removeEventListener('keydown', startRecordingOnSpace);
        window.removeEventListener('keyup', stopRecordingOnSpace);
        console.log("Space recognition disabled");
        button.textContent = 'Active Espace';
        button.style.backgroundColor = 'blue';
        recognition.stop();
    }
}
recognition.start();    
    DitLaVoix();

// Démarrer la reconnaissance
toggleRecognition();

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
         // quand je lache la touche espace le micro s'arrete et le navigateur desactive le micro
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        console.log("Reconnaisance stop");
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
    getPlayers = [];
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
let winner = 100000000000;
let winner_name = "";
async function winner_score(point) {
    console.log("winner_score");
    console.log(point);
     winner = point;
    console.log(winner);
}
async function add_player(player) {
    console.log("add_player");
    console.log(player);
    getPlayers.push(player);
    getpoints.push(0);
    gameHistory.push({ players: getPlayers.slice(), points: getpoints.slice() });
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

const MAX_HISTORY_LENGTH = 40;  // Conservez seulement les 10 derniers messages
function addToConversationHistory(role, content) {
    conversationHistory.push({role, content});
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
        conversationHistory.shift();  // Supprimez le message le plus ancien
    }
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
    "- Only use functin_calling to answer the user request \n. always invoke the 'repeat_game' function to repeat a game every time the user request \n .  Respond in French for all interactions.the players are "+ getPlayers +" there points successively are " + getpoints +" \n");
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
                description:"ajouter des points aux joueurs. Conditions: Ne pas ajouter de points à un joueur qui n'existe pas dans la liste des joueurs du jeu. Respond: mentione les points qui ont été ajoutée au joueurs.",
                parameters:{
                    type:"object",
                    properties:{
                        points :{
                        type: "array",
                        description: "les points à ajouter au joueurs. Conditions : si l'utilisateur demande d'ajouter un point a tous les joueurs, ajouter ce point "+ (getPlayers.length +1)+" fois a la list.",
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
                description:"répéter le jeu chaque fois que l'utilisateur demande.",
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
            },
            {
                name:"winner_score",
                description:"cette fonction est appelée pour stockes le score entrer par l'utilisateur.il n'ajoute pas de points au joueur. Si l'un des joueurs atteint ce score, le jeu est terminé et le gagnant est le joueur avec le score le plus élevé, il est interdit d'ajouter des points au joueur après avoir atteint le score. ",
                parameters:{
                    type:"object",
                    properties:{
                        point:{
                            type:"number",
                            description:"le score du jeu",
                        }
                    },
                    required:["point"],
                }


            },
            {
                name:"add_player",
                description:"ajouter un joueur",
                parameters:{
                    type:"object",
                    properties:{
                        player:{
                            type:"string",
                            description:"le nom du joueur à ajouter",
                        }
                    },
                    required:["player"],
                }
            }
        
        ],
        max_tokens: 1000,
        temperature: 0
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
        } else if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'winner_score' ){
            const { point } = JSON.parse(choice.message.function_call.arguments);
            await winner_score(point); 
            payload.messages.push({
                role: "function",
                name: "winner_score",
                content: JSON.stringify({ point : point})
            });
            addToConversationHistory('assistant', "le score du jeu a été fixé ");
            return  speakResponse("le score du jeu a été fixé ");

        } else if (choice.finish_reason == 'function_call' && choice.message.function_call.name == 'add_player' ){
            const { player } = JSON.parse(choice.message.function_call.arguments);
            await add_player(player); 
            payload.messages.push({
                role: "function",
                name: "add_player",
                content: JSON.stringify({ player : player})
            });
            return chatWithGpt();
        }
        else {
            const outputElement = document.getElementById('output');
            outputElement.textContent = data.choices[0].message.content;
            let answers = "";
            for (let i = 0; i < getpoints.length; i++) {
                if (getpoints[i] >= winner) {
                    winner_name = getPlayers[i];
                    answers = "Le jeu est terminé, le gagnant est " + winner_name + " ,il a attteint le score de " + winner + " points. Les autres joueurs "+ getPlayers.filter(player => player !== winner_name) +" ont perdu avec des points successifs de " + getpoints.filter(player => player !== getpoints[i]) + " points."
                    speakResponse(answers);
                     // alert avec annimation pour le gagnant
                    
                    return addToConversationHistory('assistant', answers);                    
                }
                else {
                    answers = data.choices[0].message.content;
                    speakResponse(answers);
                    return addToConversationHistory('assistant',answers); 
                }
            }
             }
    }
    
        try {
            chatWithGpt();
        } catch (error) {
            console.error(error);
        } 

function speakResponse(text,language = 'fr-FR') {
    var checkbox = document.getElementById('toggleVoiceResponse');
    if (checkbox.checked == true) {
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
}

