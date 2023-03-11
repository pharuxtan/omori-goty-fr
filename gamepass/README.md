Code de la DLL qui modifie le binaire du jeu au lancement, ce base sur le fais de proxy le XCurl.dll pour y injecter du code arbitraire au lancement du programme

Pour compiler la DLL il vous faut Visual Studio, ouvrir le sln, et compiler le programme.

Une fois compilé vous aurez un XCurl.dll, il vous suffira de renommer le XCurl.dll originel en XCurlLib.dll et de mettre au même endroit le XCurl.dll compilé

Le code arbitraire du XCurl modifie la taille en hauteur précompilé de l'image img/system/statelist.png pour la dédoubler, ainsi que force le programme à être en anglais (langue par défaut) pour rendre l'adaptation plus simple