# 🚀 MonProjet - Serveur avec Gestion en Arrière-plan

Ce projet permet de gérer un serveur Node.js localement avec une interface simplifiée dans la barre des tâches (System Tray) de Windows, permettant de démarrer ou d'arrêter le serveur en un clic.

## 🛠️ Fonctionnalités

* **Contrôle en arrière-plan :** Le serveur tourne de manière invisible sans fenêtre de terminal encombrante.
* **Interface Tray :** Icône dans la barre des tâches (à côté de l'horloge) avec menu contextuel :
    * **On :** Démarre le serveur.
    * **Off :** Arrête proprement le processus Node.js.
    * **Quitter :** Ferme l'application et arrête le serveur.
* **Notifications :** Alertes visuelles lors du passage en mode "ON" ou "OFF".
* **Installation automatique :** Vérification et installation automatique des dépendances (node_modules) au premier lancement.

## 📦 Installation

1. **Cloner le dépôt :**
   ```bash
   git clone [https://github.com/YahiaCherifRyan/StockageUtilisateur.git](https://github.com/YahiaCherifRyan/StockageUtilisateur.git)
   cd StockageUtilisateur
## Prérequis :

Assurez-vous d'avoir Node.js installé sur votre machine.

## Lancement :

Exécutez simplement le fichier Demarrage.bat.

Une icône apparaîtra dans votre zone de notification (cliquez sur la petite flèche près de l'horloge si elle n'est pas visible directement).

## ⚙️ Utilisation
Faites un clic droit sur l'icône dans la barre des tâches pour accéder au menu.

Le script gère automatiquement le cycle de vie du serveur.

Puis vous aviez un fichier Commande.bat, c'est içi que vous pouvez faire des modifications sur les utilisateurs/rôles.

## 📝 Licence
Ce projet est libre d'utilisation.
