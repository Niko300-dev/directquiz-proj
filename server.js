//const https = require('https');
//const fs = require('fs');
/*
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};
*/

var express = require('express');
const axios = require('axios');
const MINUTES_TIMEOUT = 30;
var app = express();
var server = app.listen(3000);
const regexHTML = /(<([^>]+)>)/ig;

app.use(express.static('public'));

console.log("Le serveur est effectif !");

var socket = require('socket.io');

var io = socket(server);

var cptQuestion = -1;
var cptReponseDonnee = 0;

io.sockets.on('connection', newConnection);

io.use(function(socket, next) {
  var handshakeData = socket.request;
  console.log("TOKEN : ", handshakeData._query['token']);
  next();
});

var listeDesMembres = new Array(0);
var listeDesMembresOffline = new Array(0);
var listeDesMembresAvecDetailOffline = new Array(0);
var listeDesMembresAvecDetail = new Array(0);
var listeDesMembresRestant = new Array(0);
var countMember = 0;
var allClients = new Array(0);
var listeRepondantCorrect = new Array(0);
var listeQuestions = new Array(0);
var chrono = null;
var chronoPhHasard = null;
var chronoPhSortieHasard = null;
var isStart = false;
var isFinish = false;
var listePhrasesInutiles = new Array(0);
var listePhrasesSortie = new Array(0);
var timeout = false;

init();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function lancerUnePhraseAuHasard()
{
	
	var phraseRandom = listePhrasesInutiles[getRandomInt(0,listePhrasesInutiles.length)];
	var membre1 = listeDesMembres[getRandomInt(0,listeDesMembres.length)];
	var membre2 = "quelqu'un";
	

	if (isFinish)
	{
		phraseRandom = listePhrasesSortie[getRandomInt(0,listePhrasesSortie.length)];
	}
	else
	{	
		if ((phraseRandom.lastIndexOf("ggg") > -1) && (listeDesMembres.length > 1))
		{
			membre1 = listeDesMembres[getRandomInt(0,listeDesMembres.length)];		
		
				do {
					membre2 = listeDesMembres[getRandomInt(0,listeDesMembres.length)];
				}
				while (membre1 == membre2);
			
			
			 phraseRandom = phraseRandom.replace(/mmm/,membre1).replace(/ggg/,membre2);
		}
		else
		{
			 phraseRandom = phraseRandom.replace(/mmm/,membre1);
		}
	}
	io.sockets.emit('annonce',{type:99,annonce:phraseRandom});
}

function init(resetMember)
{
	isStart = false;
	isFinish = false;

	clearInterval(chronoPhSortieHasard);
	
	listeRepondantCorrect = new Array(0);
	countMember = 0;
	
	if (resetMember)
	{
		listeDesMembres = new Array(0);
		listeDesMembresAvecDetail = new Array(0);
		listeDesMembresRestant = new Array(0);
		listeDesMembresOffline = new Array(0);
		listeDesMembresAvecDetailOffline = new Array(0);
	}
	else
	{
		isFinish = true;
	}	
	
	cptQuestion = -1;
	cptReponseDonnee = 0;
	chrono = null;
	var maxQuestionID = 1;
	
	listeQuestions = new Array(0);
	var listeIDQuestions = new Array(0);
	var IDgot = 0;
			  
		axios.post('https://niko.ovh/directquiz89/getCount.php', {

		  })
		  .then(function (response) {
			maxQuestionID = response.data;
			console.log(maxQuestionID);

			  
			  for (i = 0; i < 10;i++)
			  {				  
					do {
						IDgot = getRandomInt(1, parseInt(maxQuestionID,10))
					  } while (listeIDQuestions.indexOf(IDgot) > -1);

				listeIDQuestions.push(IDgot);
			  }
			  
				for (i = 0; i < 10;i++)
				{
					//console.log(">>>"+listeIDQuestions[i]+"<<<");
					
				const params = new URLSearchParams();
				params.append('id', listeIDQuestions[i]);
				axios({
				  method: 'post',
				  url: 'https://niko.ovh/directquiz89/getQuestion.php',
				  data: params
				}).then(function (response) {
					  //console.log(response.data);
					var resultQuestion = response.data.split("###");
					listeQuestions.push(new question(resultQuestion[0],resultQuestion[1].toUpperCase()));
				  })
				  .catch(function (error) {
					console.log(error);
				  });
					
				}
				
				  
		  })
		  .catch(function (error) {
			console.log(error);
		  });


	/*
	listeQuestions.push(new question("QUESTION 1 : Quelle marque a popularisé le casque VR ?","htc".toUpperCase()));
	listeQuestions.push(new question("QUESTION 2 : Quel est la première console de Sony ?","Playstation|ps1|psx|ps|Play station|Play-station".toUpperCase()));
	listeQuestions.push(new question("QUESTION 3 : Quelle marque automobile allemande a été reprise par le groupe PSA ?","Opel".toUpperCase()));
	//listeQuestions.push(new question("QUESTION 4 : Combien font 5 x 7 ?","35".toUpperCase()));
	//listeQuestions.push(new question("QUESTION 5 : Comment se nomme l'équipe nationale de Football belge ?","Diables rouges".toUpperCase()));
	*/
	
    listePhrasesInutiles = new Array(0);

listePhrasesInutiles.push("J'ai l'impression que mmm essaie de tricher sur ggg");
listePhrasesInutiles.push("Je me demande ce que nous réserve mmm sur cette partie");
listePhrasesInutiles.push("Apparement, mmm est content d'être là !");
listePhrasesInutiles.push("mmm devrait arrêter de se tourner les pouces et se concentrer sur la partie.");
listePhrasesInutiles.push("mmm est certainement décidé à gagner cette partie !");
listePhrasesInutiles.push("mmm mise tout sur sa victoire...");
listePhrasesInutiles.push("Il semblerait que mmm ai bien révisé ses classiques.");
listePhrasesInutiles.push("mmm aimerait être aussi malin que ggg");
listePhrasesInutiles.push("Je pense que mmm est un bon ami de ggg");
listePhrasesInutiles.push("mmm pense surement qu'il va gagner la partie");
listePhrasesInutiles.push("mmm est un redoutable adversaire, il cache bien son jeu...");
listePhrasesInutiles.push("mmm devrait se méfier de ggg...");

listePhrasesSortie = new Array(0);

listePhrasesSortie.push("Veuillez quitter la salle car le quiz est terminé...");
listePhrasesSortie.push("Veuillez sortir du plateau en file indienne...");
listePhrasesSortie.push("Prière de déguerpir avant qu'on ferme !");
listePhrasesSortie.push("Vous prenez vos affaires et vous foutez le camp !");
listePhrasesSortie.push("Si vous ne déguerpissez pas immédiatement, j'appelle les flics !");
listePhrasesSortie.push("Sécurité ! Evacuez-moi ces gens !");

setInterval(disconnectIfTimeout, 300000);

}

function question(description, reponse)
{
	this.description = description;
	this.reponse = reponse;
}

function membre(id, name, tokentime, points)
{
	this.id = id
	this.name = name;
	this.tokentime = tokentime;
	this.points = points;
}

function nextQuestion()
{
	listeRepondantCorrect = new Array();
	cptReponseDonnee = 0;
	
	
	if (cptQuestion >= (listeQuestions.length-1))
	{
		clearInterval(chrono);
		setTimeout(function(){
			isStart = false;
			io.sockets.emit('annonce',{type:4,annonce:"Le temps est écoulé... La bonne réponse était \""+listeQuestions[cptQuestion].reponse.split("|")[0]+"\" !"});
			isFinish = true;
			timeout = true;
				setTimeout(function(){
					io.sockets.emit('annonce',{type:4,annonce:"Le quiz est terminé ! Merci à tous pour votre participation !"});
					updateScoreInDB();
					init(false);
					chronoPhSortieHasard = setInterval(lancerUnePhraseAuHasard, 15000);					
				},6000);

		},250);
	}
	else
	{

		setTimeout(function(){
			timeout = true;
			io.sockets.emit('annonce',{type:4,annonce:"Le temps est écoulé... La bonne réponse était \""+listeQuestions[cptQuestion].reponse.split("|")[0]+"\" !"});
			setTimeout(function(){
				cptQuestion++;
				io.sockets.emit('annonce',{type:4,annonce:"QUESTION " + (cptQuestion + 1) + " : " + listeQuestions[cptQuestion].description});
				timeout = false;
				
				setTimeout(lancerUnePhraseAuHasard,30000);
				
				
			},7000);
		},250);		

	}
	
}

function isMatch(msg, reponseAttendue)
{
	var arrayReponse = reponseAttendue.split("/");
	var messageSalted = "";
	var charTemp = "";
	var msgArray = Array.from(msg+" ");
	
	for (i = 0; i < arrayReponse.length ; i++)
	{
		for (j = 0; j < msg.length ; j++)
		{		
			msgArray = Array.from(msg+" ");
			charTemp = msgArray[j];
			msgArray[j] = msgArray[j+1];
			msgArray[j+1] = charTemp;
			messageSalted = msgArray.join("");
			console.log("SALT:" + messageSalted.toUpperCase() + " REP:" + arrayReponse[i] + " MSG:" + msg.toUpperCase());
			if (messageSalted.toUpperCase().trim().lastIndexOf(arrayReponse[i])  > -1 || msg.toUpperCase().lastIndexOf(arrayReponse[i]) > -1) return true;
		}
		
	}
	
	return false;
	
}

function annonceCandidats()
{
	var arrayPremiersMembresAPresenter = new Array(0);
	var dernierMembreAPresenter = "";
	
	for (i = 0; i < listeDesMembres.length-1; i++)
	{
		arrayPremiersMembresAPresenter.push(listeDesMembres[i]);
	}
	
	dernierMembreAPresenter = listeDesMembres[listeDesMembres.length-1];
	
	io.sockets.emit('annonce',{type:99,annonce:"Souhaitons la bienvenue aux nouveaux joueurs " + arrayPremiersMembresAPresenter.join(", ") + " et "+ dernierMembreAPresenter +". Dés à présent, que le meilleur gagne !"});
	
}

function newConnection(socket)
{
	allClients.push(socket);
	console.log('new connection' + socket.id);
	console.log(socket.id);
	//3598bde5-abe2-4703-a481-384c5276f2b7

	socket.on('message', messageGet);
	socket.on('addMember', addMember);
	socket.on('alive', isAlive);
	
	socket.on("disconnect", function(){		
		var i = allClients.indexOf(socket);
		listeDesMembresAvecDetailOffline.push(listeDesMembresAvecDetail[i]);
		listeDesMembresOffline.push(listeDesMembres[i]);
		
		if (listeDesMembres[i] !== undefined)
		{
			socket.broadcast.emit('annonce',{type:2,annonce: listeDesMembres[i] + " s'est déconnecté !"});
		}
		
		allClients.splice(i, 1);
		listeDesMembres.splice(i, 1);
		listeDesMembresAvecDetail.splice(i, 1);
		
		
		console.log(allClients.length + " joueur(s) encore connecté...");
		if (allClients.length > 0)
			refreshListeSlots();
		else
			init(true);
		
	});
	
		
		refreshListeSlots();
		
	function messageGet(data)
	{
		console.log(data.pseudo + " : " + data.message);
		
		var message = data.message.replace(regexHTML,"");
		
		reponseAttendue = "3598bde5-abe2-4703-a481-384c5276f2b7";
		
		if (cptQuestion >= 0 && cptQuestion < listeQuestions.length) reponseAttendue = listeQuestions[cptQuestion].reponse;
			
		//refreshListeSlots();	
		
		if (message == "/start")
		{
			if (listeDesMembres.length >= 2 && !isStart)
			{
				isStart = true;
				isFinish = false;
				clearInterval(chronoPhSortieHasard);
				listeRepondantCorrect = new Array();
				timeout = false;				

				if (cptQuestion == -1)
				{
					cptQuestion++;
					
					for (i = 0; i < listeDesMembresAvecDetail.length; i++)
					{
						listeDesMembresAvecDetail[i].points = 0;
					}
					
					refreshListeSlots();
					
					setTimeout(function(){
						
						annonceCandidats();
						
						setTimeout(function(){
							io.sockets.emit('annonce',{type:4,annonce:"QUESTION " + (cptQuestion+1) + " : " + listeQuestions[cptQuestion].description});
						},15500);
					
					},2000);
					

					
					chrono = setInterval(nextQuestion,55000);
				}
				else
				{
					//io.sockets.emit('annonce',{type:4,annonce:"Le quiz est terminé ! Merci à tous pour votre participation !"});
				}
			}
			else
			{
				if (listeDesMembres.length < 2) io.sockets.emit('annonce',{type:99,annonce:"Tu dois avoir des adversaires pour pouvoir lancer une partie..."});
				else if (isStart) io.sockets.emit('annonce',{type:99,annonce:"La partie est déjà lancée !"});
			}
		}
		else if (!timeout && (!isFinish && isStart && (isMatch(message.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), reponseAttendue.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) && cptQuestion >= 0)))
		{
			
			
			//data.message.toUpperCase().lastIndexOf(reponseAttendue) > -1
			
				var pts = 0;

				if (listeRepondantCorrect.lastIndexOf(data.pseudo) == -1)
				{
					cptReponseDonnee++;
					
					switch (cptReponseDonnee)
					{
						case 1 : pts = 10; break;
						case 2 : pts = 5; break;
						case 3 : pts = 2; break;
						case 4 : pts = 2; break;
						default : pts = 0;					
					}
					
					if (pts > 0)
					{
						var indexToAddPoints = listeDesMembres.indexOf(data.pseudo);
						listeDesMembresAvecDetail[indexToAddPoints].points += pts;
						io.sockets.emit('annonce_user',{type:3, user:data.pseudo,annonce: "Bonne réponse ! "+pts+" points gagnés !"});	
						socket.broadcast.emit('annonce',{type:3,annonce: data.pseudo + " a trouvé la bonne réponse ! "+pts+" points gagnés !"});
						listeRepondantCorrect.push(data.pseudo);
						refreshListeSlots();
					}
				}
		}
		else
		{
			if (message.indexOf("/kick ") == 0)
			{
				var commande = message.split(" ");
				kick(commande[1]);
			}
			else
			{
				socket.broadcast.emit('message', data);
			}
		}
		
		
	}
	
	function addMember(data)
	{
	
	var pseudo = data.pseudo.replace(/ /g, "");
	
		console.log("Adding member : " + pseudo);
		var re = "";
		var dataAckMaxUser = {msg:"ERROR_TOMANYUSER"}
		var dataAckExist = {msg:"ERROR_ALREADYEXIST"}
		var dataAckOK = {msg:"OK"}
		
		if (listeDesMembres.length == 8)
		{
			console.log("REFUS 8 MAX");
			socket.emit('ack', dataAckMaxUser);
			socket.disconnect(true);
		}
		else if (listeDesMembres.indexOf(pseudo) > -1)
		{
			console.log("REFUS PSEUDO EXISTE");
			socket.emit('ack', dataAckExist);
			socket.disconnect(true);
		}
		else
		{	
			console.log("ACCES AUTORISE");
			socket.emit('ack', dataAckOK);
			
			var idOfficielOffline = listeDesMembresOffline.lastIndexOf(pseudo);
			
			if (idOfficielOffline > -1)
			{
				re = "re";
				var returnMembre = listeDesMembresAvecDetailOffline[idOfficielOffline];
				returnMembre.tokentime = Math.floor(Date.now() / 1000)
				listeDesMembresOffline.splice(i, 1);
				listeDesMembresAvecDetailOffline.splice(i, 1);
				
				listeDesMembresAvecDetail.push(returnMembre)
			}
			else
			{
				listeDesMembresAvecDetail.push(new membre(data.id, pseudo,Math.floor(Date.now() / 1000),0));
			}

			listeDesMembres.push(pseudo);
			
			countMember = listeDesMembres.length;
			socket.broadcast.emit('annonce',{type:1,annonce:pseudo + " s'est " + re + "connecté !"});
			refreshListeSlots();			
		}
		
	}
	
	function refreshListeSlots()
	{
		var listeSlots = new Array(0);
		for (i = 0; i < listeDesMembres.length; i++)
		{
			listeSlots.push(listeDesMembresAvecDetail[i]); 
		}
		
		listeSlots.sort(function (a, b) {
		   return b.points - a.points;
		});
		
		io.sockets.emit('slots', listeSlots);
		
	}
	
	function isAlive(data)
	{	
		listeDesMembresRestant.push(data.pseudo);	
		console.log(data.pseudo + " est encore en ligne...");	
	}
	
}

	function disconnectIfTimeout()
	{
		var currentTime = Math.floor(Date.now() / 1000);
		
		for (i = 0; i < listeDesMembresAvecDetail.length; i++)
		{
			if (Math.floor((currentTime - listeDesMembresAvecDetail[i].tokentime) / 60) >= MINUTES_TIMEOUT)
			{
				if (listeDesMembres[i] !== undefined)
				{
					io.sockets.emit('annonce',{type:5,annonce:listeDesMembres[i] + " a été expulsé pour libèrer de la bande passante..."});
				}
				listeDesMembresAvecDetail[i].points = 0;
				allClients[i].disconnect(true);
				
			}
		}
	}

	function kick(pseudo)
	{
		
		for (i = 0; i < listeDesMembres.length; i++)
		{
			
				if (listeDesMembres[i].toUpperCase() == pseudo.toUpperCase())
				{
					io.sockets.emit('annonce',{type:5,annonce:listeDesMembres[i] + " a été expulsé de la partie..."});
					listeDesMembresAvecDetail[i].points = 0;
					allClients[i].disconnect(true);	
				}

		}
	}
	
	function updateScoreInDB()
	{
		for (i = 0; i < listeDesMembresAvecDetail.length; i++)
		{
			
			const params = new URLSearchParams();
				params.append('id_user', listeDesMembresAvecDetail[i].id);
				params.append('points', listeDesMembresAvecDetail[i].points);
				axios({
				  method: 'post',
				  url: 'https://directquiz.niko.ovh/dev/ajax/score101.php',
				  data: params
				}).then(function (response) {
						console.log("Membre \""+ listeDesMembresAvecDetail[i].name + "\" --> Score enregistré avec succès dans la DB !");
				  })
				  .catch(function (error) {
					console.log(error);
				  });

		}
	}
// C:\Users\nico3\nodeServeur\server.js