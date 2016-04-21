# DinoRPG-Assistant

Diverses petites améliorations pour le jeu DinoRPG :

* Un décompte du temps avant nouvelle action pour chaque dinoz ;
* Les niveaux indiqués à côté de chaque dinoz ;
* Un système de « marquage » pour les dinoz qui ne doivent pas monter de niveau (détails à ce propos plus bas).

## Comment on s'en sert ?

Il vous faut un gestionnaire d'userscripts. C'est une extension de navigateur. Les plus connus sont :

* Greasemonkey pour Firefox (testé)
* Tampermonkey pour Chrome/Chromium (testé)
* NinjaKit pour Safari (**non** testé)

*Nota Bene:* habituellement, mon cycle de test est le suivant : je développe sous Firefox/Greasemonkey, puis teste sous Chrome/Tampermonkey, toutes versions à jour. Je fais mon possible pour éviter de laisser des bugs sous Chrome, mais il arrivent que certains passent entre les mailles du filet. Quant aux autres navigateurs, je ne peux pas y garantir la compatibilité de mon script,

Une fois votre gestionnaire d'userscripts installé, cliquez simplement sur le lien du script : [dinorpg-assistant.user.js](https://github.com/Watilin/DinoRPG-Assistant/raw/master/dinorpg-assistant.user.js). Votre gestionnaire vous demandera l'autorisation d'installer le script. L'installation est automatique.

## Vos données privées

Ce script ne vole pas vos données ;) Il ne fait pas de requêtes ni vers les serveurs de DinoRPG ni vers un serveur tiers. Les données sont stockées en local sur votre machine, et sont automatiquement supprimées si vous désinstallez le script.

## Les « dinoz qui ne doivent pas monter de niveau »… ?

Ce script ne permet pas de faire faire des actions à un dinoz de niveau inférieur à 11 quand il est prêt à passer au niveau supérieur, conformément à la charte du jeu.

La fonctionnalité de « marquage » n’est active que sur les dinoz de niveau 11 et plus ; d’autre part, il s’agit principalement d’une indication visuelle (les images « level up » sont grisées et ne clignotent plus), et le bouton de level up est désactivé dans le seul but d’empêcher le joueur de cliquer dessus accidentellement.

Bien entendu, seuls les dinoz que le joueur a choisi de marquer sont « protégés », les autres dinoz peuvent continuer à monter de niveau normalement.

## Désinstaller le script

La désinstallation est gérée par votre gestionnaire d'userscript. Reportez-vous à l'aide de ce dernier pour plus d'informations. Normalement, c'est pas franchement compliqué ;)

## License

GNU/GPL v2 ; voir [LICENCE](https://github.com/Watilin/DinoRPG-Assistant/blob/master/LICENSE)

## Historique des versions

Voir [changelog.md](https://github.com/Watilin/DinoRPG-Assistant/blob/master/changelog.md)
