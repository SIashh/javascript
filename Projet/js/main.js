$(document).ready(function(){
  var form = $('form');
  var liste = $('.body');

  $( "#tabs" ).tabs();

  //change l'apparence du bouton submit
  $('#submit').addClass("ui-icon ui-icon-circle-triangle-e");

  //initialisation des paramètres du calendrier
  $.datepicker.setDefaults({
    showOn: "both",
    buttonText : "📅"
  });

  //initialisation du calendrier
  $("#datepicker").datepicker();
  //modification de certains paramètres du calendrier
  $("#datepicker").datepicker("setDate","today");
  $("#datepicker").datepicker("option", "dateFormat", "dd-mm-yy");


  var tableau = $('.tableau').DataTable( {
    columns: [
      { title: 'Picture' },
      { title: 'Title' },
      { title: 'Owner' },
      { title: 'Date' }
    ]
  } );


  var isSelected = false;
  var search = "";

  //modèle représentant une image
  var Image = function(){
    this.id = null;
    this.url = null;
    this.owner = null;
    this.location = null;
    this.title = null;
    this.date = null;
  }

  //modèle représentant toutes les images retournées par flickr
  var Images = function(){
    this.images = new Array();
  }

  $("#search").autocomplete({
    source: function( request, response ) {
      $.ajax({
        dataType: "json",
        type : 'GET',
        data: {
          commune :$(this)[0].term,
          maxRows:50
        },
        url: 'http://infoweb-ens/~jacquin-c/codePostal/commune.php',
      }).done(function(data){
        console.log(data);
        var data2 = data.map(function (item) {
          console.log(item);
          return {
            label :item.Ville,
            value:item.Ville,
          };
        });
        response(data2);
      });
    },
    classes: {
      "ui-autocomplete": "highlight"
    },
    select:function (event,ui) {
      isSelected = true;
      search = ui.item.value;
      // console.log( "Selected: " + ui.item.value  );
    }
  });

  //permet de supprimer la fenêtre d'informations sur une photo si elle est ouverte quand on passe dans l'onglet
  //du tableau
  $(".ui-tabs-anchor").click(function(){
    $('#infosPhoto').empty();
    $('#infosPhoto').dialog().dialog("close");
  });

  form.submit(function(e){
    //on récupère la date de prise de photo minimum désirée
    var date = $("#datepicker").val();
    //on ferme la fenêtre d'informations sur une photo si elle est ouverte
    $('#infosPhoto').dialog().dialog("close");
    e.preventDefault();
    tableau.clear();

    //Si on sélectionne bien un item de la liste proposée par l'autocomplétion
    if (isSelected && search != "") {
      var input = search;
      var perPage = $('input[name="nbResults"]').val();
      console.log(input +" "+perPage);
      //si on ne sélectionne pas de nombre on affiche 100 photos par page de base
      if (perPage == 0) {
        perPage = 100;
      }
      //requête tappant dans Flickr pour récupérer les photos correspondant aux critères demandés
      //critère : nombre de photo par page; date d'upload minimum; ville
      $.ajax({
        url : 'https://api.flickr.com/services/rest/',
        type : 'GET',
        data : {
          method : "flickr.photos.search",
          api_key : "044417fb5b28b6ccb072373638d89bd4",
          tags : input,
          format : "json",
          nojsoncallback : "1",
          min_upload_date : date,
          per_page : perPage
        },
        success : function(codeHtmlSucces, statut){
          console.log("succès");
        },
        error : function(resultat, statut, erreur){
          console.log(erreur);
        }
      }).done(function(data){
        //instanciation du modèle contenant toutes les images
        var tableImg = new Images();
        tableau.clear();
        var photos = data.photos.photo;
        $(".body").empty();
        if (photos.length != 0) {
          $('#NoCityFound').css("display", "none");
          $('#NoCityFound').dialog().dialog("close");

          //pour chaque photo retournée par la première requête on fait une requête vers un autre point d'entrée de l'api
          //pour obtenir des infos complémentaires que l'on rentre dans le modèle
          $.each(photos, function(i,data){
            //instanciation du modèle d'une image
            var simpleImg = new Image();
            simpleImg.id = data.id;
            simpleImg.url = "https://farm"+data.farm+".staticflickr.com/"+data.server+"/"+data.id+"_"+data.secret+".jpg";
            console.log("dzpadzada");
            $('#infosPhoto').empty();
            var ajax = $.ajax({
              url : 'https://api.flickr.com/services/rest/',
              type : 'GET',
              format : "json",
              nojsoncallback : "1",
              data : {
                method : "flickr.photos.getInfo",
                format : "json",
                api_key : "044417fb5b28b6ccb072373638d89bd4",
                nojsoncallback : "1",
                photo_id : data.id,
                secret : data.secret
              },
              success : function(codeHtmlSucces, statut){
                console.log("succès");
              },
              error : function(resultat, statut, erreur){
                console.log(erreur);
              }
            }).done(function(data){
              //remplissage du modèle de l'image
              var owner = data.photo.owner;
              simpleImg.owner = owner.username;
              simpleImg.title = data.photo.title._content;
              simpleImg.location = owner.location;
              simpleImg.date = data.photo.dates.taken;
              tableImg.images.push(simpleImg);

              //ajout dans la vue liste de l'image
              liste.append("<li class='bodyLi'>\n<div class='gallery'><img id ='image"+i+"' class='bodyImg' src ="+simpleImg.url+">\n</div></li>");
              var clickableImg = $("#image"+i);

              //permet d'afficher une fenêtre modale avec des infos complémentaires lorsque l'on clique sur une photo de la liste
              clickableImg.click(function(){
                $('#infosPhoto').empty();
                $('#infosPhoto').dialog().dialog("close");
                if(simpleImg.location != ""){
                  $('#infosPhoto').append("<p> Prise de la photo : "+simpleImg.location+"</p>");
                }
                if(simpleImg.title != ""){
                  $('#infosPhoto').append("<p> Nom du cliché : "+simpleImg.title+"</p>");
                }
                if(simpleImg.owner != ""){
                  $('#infosPhoto').append("<p> Photographe : "+simpleImg.owner+"</p>");
                }
                if(simpleImg.date != " "){
                  $('#infosPhoto').append("<p> Date de prise : "+simpleImg.date+"</p>");
                }
                $('#infosPhoto').css("display", "block");
                $('#infosPhoto').dialog().dialog("open");
              });
              //ici on rempli le tableau avec l'image et les infos complémentaires
              tableau.row.add( ["<img class='bodyImg' src ="+simpleImg.url+" >",simpleImg.title,simpleImg.owner,simpleImg.date] ).draw();
            });
          });
        }
        //lorsqu'il n'y a aucun résultat on affiche une fenêtre modale d'erreur
        else{
          $('#NoCityFound').css("display", "block");
          $('#NoCityFound').dialog().dialog("open");
        }
      });
    }else{
      alert("Veuillez choisir une ville");
    }
  });
});
