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
      var photos = data.photos.photo;
      $("li").remove();
      if (photos.length != 0) {
        $('#NoCityFound').dialog().dialog("close");
        $('#NoCityFound').css("display", "none");
        $.each(photos, function(i,data){
          liste.append("<li><img src =https://farm"+data.farm+".staticflickr.com/"+data.server+"/"+data.id+"_"+data.secret+".jpg></li>");
        });
        var photo = $('img');
        $.each(photo, function(index, photos){
          console.log(photos);
          photo.click(function(){
            console.log(" test");
          $.ajax({
            url : 'https://api.flickr.com/services/rest/',
            type : 'GET',
            format : "json",
            nojsoncallback : "1",
            data : {
              method : "flickr.photos.getInfo",
              api_key : "044417fb5b28b6ccb072373638d89bd4",
              photo_id : photo.id,
              secret : photo.secret
            },
            success : function(codeHtmlSucces, statut){
              console.log(data);
              console.log("succès");
            },
            error : function(resultat, statut, erreur){
              console.log(erreur);
            }
          }).done(function(data){
            console.log(data);
            $('#infosPhoto').append("<p>"+data+"</p>");
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
