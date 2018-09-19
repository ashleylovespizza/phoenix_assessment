
var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keypea3CJfSCwG8tn' }).base('appur6EvjZzuIGG3Q');


$(document).ready(function() {

    var userid = (Cookies.get("nwh_userid"));
    var name = Cookies.get("nwh_user");

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");


      base('UsersSiteInteractions').create({
          "Name":  name,
          "User ID": userid,
          "Path": "Nav-Burger-Click",
          "Interaction": Number($(".navbar-menu").hasClass("is-active"))
      }, function(err, record) {
      })

    });

    $(".surgeonPhone").click(function() {

      base('UsersSiteInteractions').create({
          "Name":  name,
          "User ID": userid,
          "Path": "Telephone-Call-Click"
      }, function(err, record) {
      })
    })




    // surgeon data
    // see if we need the surgeon cookies but don't have them

    // do this once - cookie the surgeon
    if ( Cookies.get("surgeonName") == undefined ) {
      base('Users').find(userid, function(err, record) {
          if (err) { console.error(err); return; }
            var s = record['fields']['Surgeon'][0];
            base('Surgeons').find(s, function(err, record) {

              Cookies.set("surgeonName", record['fields']['Name']);
              Cookies.set("surgeonPhotoUrl", record['fields']['Photo'][0]['url']);
              Cookies.set("surgeonPhone", record['fields']['Phone']);

              // do all your content replacement
              $(".surgeonName").html(Cookies.get("surgeonName"));
              $("#surgeonPhoto img").attr("src", Cookies.get("surgeonPhotoUrl"));
              $("#surgeonPhoto img").attr("alt", Cookies.get("surgeonName"))
              $(".surgeonPhone").html(Cookies.get("surgeonPhone"));
            })
      });
    } 

    // do all your content replacement
    $(".surgeonName").html(Cookies.get("surgeonName"));
    $("#surgeonPhoto img").attr("src", Cookies.get("surgeonPhotoUrl"));
    $("#surgeonPhoto img").attr("alt", Cookies.get("surgeonName"))
          $("#surgeonPhoto img").removeClass("is-invisible")
    $(".surgeonPhone").html(Cookies.get("surgeonPhone"));
    $(".surgeonPhone").attr("href", "tel:"+Cookies.get("surgeonPhone"));

});