$(document).ready(function(){
  var form = $('form');
  var liste = $('.body');


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
    var input = $('input[name="inputVille"]').val();
    var perPage = $('input[name="nbResults"]').val();
    console.log(input +" "+perPage);
    if (perPage == 0) {
      perPage = 100;
    }
    e.preventDefault();
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
          $('ul li img:last-child').click(function(){
            $.ajax({
              url : 'https://api.flickr.com/services/rest/',
              type : 'GET',
              format : "json",
              nojsoncallback : "1",
              data : {
                method : "flickr.photos.getInfo",
                api_key : "044417fb5b28b6ccb072373638d89bd4",
                photo_id : this.id,
                secret : this.secret
              },
              success : function(codeHtmlSucces, statut){
                console.log(data);
                console.log("succès");
              },
              error : function(resultat, statut, erreur){
                console.log(erreur);
              }
            }).done(function(data){
              $('#infosPhoto').append(data);
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

  });
});
