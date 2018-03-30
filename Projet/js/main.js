$(document).ready(function(){
  var form = $('form');
  var liste = $('.body');
  var isSelected = false;
  var search = "";
  $( "#tabs" ).tabs();


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

  form.submit(function(e){
    e.preventDefault();
    if (isSelected && search != "") {
      var input = search;
      var perPage = $('input[name="nbResults"]').val();
      console.log(input +" "+perPage);
      if (perPage == 0) {
        perPage = 100;
      }

      $.ajax({
        url : 'https://api.flickr.com/services/rest/',
        type : 'GET',
        data : {
          method : "flickr.photos.search",
          api_key : "044417fb5b28b6ccb072373638d89bd4",
          tags : input,
          format : "json",
          nojsoncallback : "1",
          per_page : perPage
        },
        success : function(codeHtmlSucces, statut){
          console.log("succès");
        },
        error : function(resultat, statut, erreur){
          console.log(erreur);
        }
      }).done(function(data){
        //on trouve dans photos les infos de toutes les images retournées par la requête
        var photos = data.photos.photo;
        $(".body").empty();
        if (photos.length != 0) {
          $('#NoCityFound').dialog().dialog("close");
          $('#NoCityFound').css("display", "none");
          //Sur chacune des "images infos on créer une balise image"
          console.log(photos);
          $.each(photos, function(i,data){
            liste.append("<li><img class='images' id ='image"+i+"' src =https://farm"+data.farm+".staticflickr.com/"+data.server+"/"+data.id+"_"+data.secret+".jpg></li>");
            var test = $("#image"+i);
            console.log(test);
            console.log(i);
            test.click(function(){
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
                var owner = data.photo.owner;
                $('#infosPhoto').append("<p> Endroit de la photo"+owner.location+"</p>");
                $('#infosPhoto').append("<p> Nom : "+data.photo.title._content+"</p>");
                $('#infosPhoto').append("<p> Photographe : "+owner.username+"</p>");
                $('#infosPhoto').css("display", "block");
                $('#infosPhoto').dialog().dialog("open");
              });
            });
          });
        }
        else{
          $('#NoCityFound').css("display", "block");
          $('#NoCityFound').dialog().dialog("open");
        }
      });
    }else{
      alert("Veuillez choisir une ville");
    }});
  });
