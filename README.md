# Projet - Jarvis Chatbot
Ce projet est un chatbot nommé Jarvis qui permet aux utilisateurs de dialoguer avec une intelligence artificielle pour gérer un jeu. Voici un résumé des principales fonctionnalités :

 ## Interface Utilisateur
  L'interface utilisateur est simple et intuitive. Elle se compose d'un tableau où l'utilisateur peut voir la liste des joueurs et leur points et une barre de défilement pour naviguer à travers l'historique de la conversation.

   ### Tableau de Joueurs :
        Le tableau affiche la liste des joueurs actuellement dans le jeu. Chaque ligne du tableau représente un joueur et son score actuel.

   ### Barre de défilement d'historique :
        La barre de défilement permet à l'utilisateur de naviguer à travers l'historique de la conversation. L'utilisateur peut faire défiler vers le haut pour voir les messages plus anciens et vers le bas pour voir les messages plus récents.

 ## Conversation avec Jarvis
  L'utilisateur peut interagir avec Jarvis en utilisant la reconnaissance vocale. Jarvis est capable de détecter le mot "Jarvis" et de répondre vocalement.

   ### Reconnaissance Vocale :
       L'utilisateur peut parler à Jarvis en utilisant la reconnaissance vocale. Lorsque l'utilisateur parle, Jarvis transcrit la parole en texte et l'ajoute à l'historique de la conversation.
   ### Détection du mot "Jarvis" : 
       Jarvis est capable de détecter le mot "Jarvis" dans la parole de l'utilisateur. Lorsque Jarvis détecte le mot "Jarvis", il commence à écouter les commandes de l'utilisateur.
   ### Réponse Vocale : 
       Jarvis est capable de répondre vocalement aux commandes de l'utilisateur. Lorsque Jarvis répond, sa réponse est également ajoutée à l'historique de la conversation.

 ## ChatGPT
   ChatGPT est le modèle d'intelligence artificielle utilisé par Jarvis pour comprendre et répondre aux commandes de l'utilisateur.

   ### Calling Functions : 
       Jarvis peut appeler des fonctions spécifiques en fonction des commandes de l'utilisateur. Par exemple, si l'utilisateur demande à Jarvis d'ajouter des points à un joueur, Jarvis appelle la fonction add_points.
   ### Historique de Conversation : 
   Jarvis conserve un historique de la conversation avec l'utilisateur. Cet historique est utilisé pour comprendre le contexte des commandes de l'utilisateur et pour générer des réponses appropriées. L'historique de la conversation est également affiché dans le scrolbar de l'interface utilisateur.