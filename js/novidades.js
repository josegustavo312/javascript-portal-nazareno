var qtdLimite = 10; // Limite inicial da lista
var maisLimite = 10;  // mais quantidade na lista
var qtdLista = 0;
var listaLimite = 0; // quando a lista chegar no limite

(function(){
	// Initialize Firebase
	var config = {
		// Configuração do Firebase
	};
	
	firebase.initializeApp(config);
	queryDatabase();
	
}());

function confirmar(acao){
	var confirmar = confirm("Tem Certeza que Deseja " + acao + "?");
	
	if (confirmar==true){
		return true;
	}
	else{
		return false;
	}
}

function logoff(){
	if(confirmar("Sair")){
		firebase.auth().signOut().then(function(){
			//Logoff com sucesso
		}, function(error) {
			alert(erro.message);
		});
		
		window.location.href = "index.html";
	}
}

function showSnackbar(){
	var snackbarContainer = document.querySelector('#demo-snackbar-example');
	var data = {
      message: 'Operação Realizada com Sucesso!',
      timeout: 2000
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

/* CADASTRAR */

var selectedFile;

function dataHora(){
   data = new Date();
   var dia = data.getDate();
   var mes = data.getMonth()+1;
   var hora = data.getHours();
   var minuto = data.getMinutes();
   var segundo = data.getSeconds();
   
   if(dia < 10){
	   dia = "0"+dia;
   }if(mes < 10){
	   mes = "0"+mes;
   }if(hora < 10){
	   hora = "0"+hora;
   }if(minuto < 10){
	   minuto = "0"+minuto;
   }if(segundo < 10){
	   segundo = "0"+segundo;
   }
   
   return dia+'/'+mes+'/'+data.getFullYear()+' '+hora+':'+minuto+':'+segundo;
}

// Salva as informações do arquivo
$('#image_uploads').on("change", function(event){
	selectedFile = event.target.files[0];
});

function validarCampo(){
	if(selectedFile == null){
		alert("Selecione uma Imagem");
		return false;
	}else{
		return true;
	}
}

/* Envia o arquivo */
function uploadFile(){
	
	if(validarCampo()){
		if (confirmar("Salvar")){
			$("#loginProgresso").show();
			$("#btnSalvar").hide();
			
			var postKey = firebase.database().ref('novidades/').push().key; // obtem a chave do banco de dados
			
			var storageRef = firebase.storage().ref('Novidades/' + postKey); // salva a imagem com o nome da chave
			var uploadTask = storageRef.put(selectedFile);
			
			// Registre três observadores:
			// 1. Observador 'state_changed', chamado a qualquer momento em que o estado muda
			// 2. Observador de erro, chamado de falha
			// 3. Observador de conclusão, convocado para conclusão bem-sucedida
			uploadTask.on('state_changed', function(snapshot){
				// Observe eventos de mudança de estado, como progresso, pausa e currículo
				// Obtém o progresso da tarefa, incluindo o número de bytes carregados e o número total de bytes a serem carregados
			}, function(error) {
			  // Manipula uploads mal sucedidos
			}, function() {
			  // Gerencie os uploads bem-sucedidos em completo
			  // Por exemplo, obtenha o URL do download: https: //firebasestorage.googleapis.com / ...
			  
			  // salva os dados no banco
			  var updates = {};
			  var postData = { 
				  id: postKey,
				  titulo: $("#tfTitulo").val(),
				  data: $("#tfData").val(),
				  local: $("#tfLocalidade").val(),
				  texto: $("#taDescricao").val(),
				  postagem: dataHora()
			  }
			  
			  updates['/novidades/' + postKey] = postData;
			  firebase.database().ref().update(updates);
			  
			  alert("Operação Realizada com Sucesso!");
			  window.location.href = "novidades.html";
			  
			});
		
		}else{
			// botão cancelar
		}
	}
}

/* LISTAR */

/* recupera a quantidade da lista do registro */
function qtdRegistro(){
	
	firebase.database().ref('/novidades/').once('value').then(function(snapshot){
		var PostObject = snapshot.val();
		var keys = Object.keys(PostObject);
		qtdLista = keys.length;
		
	});
	
}

/* recupera os dados */
function queryDatabase(){
	
	firebase.database().ref('/novidades/').limitToLast(qtdLimite).once('value').then(function(snapshot){
		var PostObject = snapshot.val(); // Object { -KtwGk_kKjTUfYNHv8ul: Object} recupera a chave com os dados
		var keys = Object.keys(PostObject);
		keys.reverse(); // Ordem decrescente
		var currentRow;
		
		/* Controle da lista */
		var inicioI = 0; // ponto inicial do loop
		
		qtdRegistro();
		
		if (qtdLista == 0){
			listaLimite = 0;
			
		}else if (qtdLimite > qtdLista){
			qtdLimite = qtdLimite-maisLimite;
			inicioI = qtdLimite;
			listaLimite = 1;
			
		}else{
			inicioI = qtdLimite-maisLimite;
			listaLimite = 0;
		}
		
		if(keys.length != 0){
		/* Percorre o objeto e atribui aos elementos */
		for(var i = inicioI; i < keys.length; i++){ // separa as chave 
			var currentObject = PostObject[keys[i]]; // separa os objetos
			
			currentRow = document.createElement("div");
			$(currentRow).addClass("row"+currentObject.id);
			$("#conteudoNovidades").append(currentRow);
			
			urlStorage(currentObject.id); // envia o id para popular as imagens
			
			/* Cria e adiciona os elementos */
			// Elementos
			var col = document.createElement("div");
			var assunto = document.createElement("p");
			var image = document.createElement("img");
			var postagem = document.createElement("p");
			var data = document.createElement("p");
			var local = document.createElement("p");
			var texto = document.createElement("p");
			var excluirButton = document.createElement("p");
			
			// Propriedades dos elementos
			$(assunto).html("<b>"+currentObject.titulo+"</b>");
			$(assunto).addClass("conteudoAssunto");
			image.setAttribute("id", currentObject.id); // atribui a chave de acesso ao id da imagem
			$(image).addClass("conteudoImagem");
			$(postagem).html("Postagem: " + currentObject.postagem);
			$(postagem).addClass("mdl-navigation__link");
			$(data).html("<i class='material-icons'>event</i> " + currentObject.data);
			$(data).addClass("conteudoTexto mdl-navigation__link");
			$(local).html("<i class='material-icons'>room</i> " + currentObject.local);
			$(local).addClass("conteudoTexto mdl-navigation__link");
			$(texto).html("<i class='material-icons'>subject</i> " + currentObject.texto);
			$(texto).addClass("conteudoTexto mdl-navigation__link");
			$(excluirButton).html("<button id='btnExcluir' value="+currentObject.id+" class='mdl-button mdl-js-button mdl-button--raised'> <i class='material-icons'>delete</i> Excluir </button>");
			
			// Adiciona os elementos
			$(col).append(assunto);
			$(col).append(image);
			$(col).append(postagem, data, local, texto);
			$(col).append(excluirButton);
			$(col).append("<hr><br>");
			$(currentRow).append(col);
			
		}
		
		/* Excluir novidades */
		$('button').off().on('click',function () {
			// Propriedades do botão
			var buttonId = $(this).attr('id');
			var buttonKey = $(this).attr('value');
			
			//Ações do botão
			if (buttonId == "btnExcluir"){
				removerDados(buttonKey);
			}else{
				//console.log("Clicou em outro botão " + idButton);
			}
			
		});
		
		}
		
	});
	
}

/* popula as imagens */
function urlStorage(key){
	var storage = firebase.storage();
	var storageRef = storage.ref('Novidades');
			
	storageRef.child(''+key).getDownloadURL().then(function(url) {
		var img = document.getElementById(key);
  		img.src = url;
				
	}).catch(function(err) {
  		// Lidar com quaisquer erros
		console.log("erro: " + err.message);
	});
}

/* remove os dados e as imagens */
function removerDados(key){
	
	if (confirmar("Excluir")){
		var storage = firebase.storage();
		var storageRef = storage.ref('Novidades/'+key);
			
		// Exclui os dados e imagem
		storageRef.delete().then(function() {
		  //remove os dados
		  firebase.database().ref().child('novidades').child(key).remove(); 
		  // remove a linha
		  $('.row'+key).remove();
		  
		  showSnackbar();
		  
		}).catch(function(error) {
		  // Uh-oh, ocorreu um erro!
		});
		
	}else{
		// botão cancelar
	}	
}

/* Adiciona mais postagem */
function maisPostagem(){
	if(qtdLista != 0){
		if(listaLimite == 0){
			qtdLimite = qtdLimite+maisLimite;
			queryDatabase();
		}else{
			alert("Não há mais postagem...");
		}
	}else{
		alert("Não há postagem...");
	}	
}
