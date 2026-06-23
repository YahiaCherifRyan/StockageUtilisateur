@echo off
title MonProjet - CLI
cd /d "%~dp0"

:menu
:: Nettoyage de l'écran pour un menu plus lisible
cls
echo ================================
echo        MENU DE COMMANDES CLI
echo ================================
echo 1. Creer un utilisateur
echo 2. Lister les utilisateurs
echo 3. Supprimer un utilisateur
echo 4. Creer un role
echo 5. Lister les roles
echo 6. Supprimer un role
echo 7. Ajouter une permission
echo 8. Retirer une permission
echo 9. Lister toutes les permissions
echo 0. Quitter
echo ================================

:: Réinitialisation de la variable pour éviter les entrées fantômes
set "choix="
set /p choix=Entrez votre choix : 

if "%choix%"=="1" goto create_user
if "%choix%"=="2" goto list_users
if "%choix%"=="3" goto delete_user
if "%choix%"=="4" goto create_role
if "%choix%"=="5" goto list_roles
if "%choix%"=="6" goto delete_role
if "%choix%"=="7" goto add_permission
if "%choix%"=="8" goto remove_permission
if "%choix%"=="9" goto list_permissions
if "%choix%"=="0" exit

:: Sécurité : si l'entrée ne correspond à rien, on recharge le menu
goto menu

:create_user
set "username="
set "password="
set "role="
set /p username=Nom d'utilisateur : 
set /p password=Mot de passe : 
set /p role=Role (admin/visiteur) : 
node cli.js create-user --username "%username%" --password "%password%" --role "%role%"
pause
goto menu

:list_users
node cli.js list-users
pause
goto menu

:delete_user
set "username="
set /p username=Nom d'utilisateur a supprimer : 
node cli.js delete-user --username "%username%"
pause
goto menu

:create_role
set "nom="
set "desc="
set /p nom=Nom du role : 
set /p desc=Description : 
node cli.js create-role --nom "%nom%" --description "%desc%"
pause
goto menu

:list_roles
node cli.js list-roles
pause
goto menu

:delete_role
set "nom="
set /p nom=Nom du role a supprimer : 
node cli.js delete-role --nom "%nom%"
pause
goto menu

:add_permission
set "role="
set "perm="
set /p role=Nom du role : 
set /p perm=Permission (create/read/update/delete) : 
node cli.js add-permission --role "%role%" --permission "%perm%"
pause
goto menu

:remove_permission
set "role="
set "perm="
set /p role=Nom du role : 
set /p perm=Permission a retirer : 
node cli.js remove-permission --role "%role%" --permission "%perm%"
pause
goto menu

:list_permissions
set "role_rech="
set /p role_rech=Nom du role (laisser vide pour tous) : 
if "%role_rech%"=="" (
    node cli.js list-permissions
) else (
    node cli.js list-permissions --role "%role_rech%"
)
pause
goto menu