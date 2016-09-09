 var cnt=0;
 
 var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      columnWidth: 30
 });


 var  addCartByBtn =function (){
    $.get("gridCart.html", function(data){
            $grid.append( data )
            $(".grid .grid-item:eq("+cnt+") img:eq(0)").attr("src", $("#picUrl").val());
            $(".grid .grid-item:eq("+cnt+") div:eq(0)").text($("#picDesc").val());
            $(".grid .grid-item:eq("+cnt+") abbr").attr("title","@"+$("#btnUserName").text());
            $grid.masonry("reloadItems").masonry("layout"); 
            cnt++;
         $("#picDesc").val("");
         $("#picUrl").val("");
         $('img').error(function(){
             $(this).attr('src', 'notfound.jpg');
        });
    });
       var data = {
          "username": $('#btnUserName').text(),
          "url": $('#picUrl').val(),
          "desc":$("#picDesc").val()
        };
        $.ajax({
          url: 'addNew',
          data: data,
          method: 'POST'
        }).then(function (response) {
            console.log("ok");
        },function (err) {
          console.error(err);
        });  
     };
var addCartAll = function (json,flag){
        $.get("gridCart.html", function(data){
            $grid.append( data );
            $(".grid .grid-item:eq("+cnt+") img:eq(0)").attr("src", json.cartUrl);
            $(".grid .grid-item:eq("+cnt+") div:eq(0)").text(json.cartDesc);
            $(".grid .grid-item:eq("+cnt+") abbr").attr("title","@"+json.username);
             $(".grid .grid-item:eq("+cnt+") div span").text(json.votingUser.length); 
                         if($("#btnUserName").text()==""){
                            $(".grid .grid-item:eq("+cnt+") .vote").addClass('w3-disabled');
                            $(".grid .grid-item:eq("+cnt+") .vote").removeClass('w3-hover-green');
                            $(".grid .grid-item:eq("+cnt+") .vote").click(function(){return false;});
                         }
             if(flag)
              $(".grid .grid-item:eq("+cnt+") .btns").append(" <div class='w3-button w3-hover-red close'><img src='close.png' class='twImg'></div>");
            $grid.masonry("reloadItems").masonry("layout"); 
            cnt++;
         $("#picDesc").val("");
         $("#picUrl").val("");
         $('img').error(function(){
            $(this).attr('src', 'notfound.jpg');
        });
         $("#btnAll").removeClass("w3-disabled");
         $("#btnMy").removeClass("w3-disabled");
         $("abbr").removeClass("w3-disabled");
        });

     };
 
 $(document).ready(function(){
    $.ajax({
      url: '/retrieve',
      method: 'GET'
    }).then(function (response) {
        console.log(response);
     for(var i =0;i<response.length;i++){
         addCartAll(response[i],false);
     }

    },function (err) {
      console.error(err);
    });
 });
 
  
 
 $("#btnAll").click(function(){
     $(this).addClass("w3-disabled");
     $(".grid").empty();
    cnt=0;
    $(".w3-spin").css("display","block");
        $.ajax({
      url: '/retrieve',
      method: 'GET'
    }).then(function (response) {
            $(".w3-spin").css("display","none");
        console.log(response);
     for(var i =0;i<response.length;i++){
         addCartAll(response[i],false);
     }
    },function (err) {
      console.error(err);
    });
 });
 
 $("#btnMy").click(function() {
    $(this).addClass("w3-disabled"); 
   $(".grid").empty();
    cnt=0;
    $(".w3-spin").css("display","block");
        $.ajax({
      url: '/retrieveSp',
      data:{"username":$('#btnUserName').text()},
      method: 'POST'
    }).then(function (response) {
            $(".w3-spin").css("display","none");
        console.log(response);
     for(var i =0;i<response.length;i++){
         addCartAll(response[i],true);
     }

    },function (err) {
      console.error(err);
    });
 });
 


$("#btnAddNew").click(function(){
    addCartByBtn();
});


$(document).on("click", "abbr",function(){
    console.log("click");
    var tempUser = $(this).attr("title").substring(1);
    
    $(this).addClass("w3-disabled"); 
    $(".grid").empty();
    cnt=0;
    $(".w3-spin").css("display","block");
        $.ajax({
      url: '/retrieveSp',
      data:{"username":tempUser},
      method: 'POST'
    }).then(function (response) {
            $(".w3-spin").css("display","none");
        console.log(response);
     for(var i =0;i<response.length;i++){
         addCartAll(response[i],false);
     }
    },function (err) {
      console.error(err);
    });
});

 $(document).on("click", ".vote",function(){

    var mySpan = $(this).children("span");
 $.ajax({
      url: '/vote',
      data: {"username":$("#btnUserName").text(),
             "desc":$(this).parents(".grid-item").children("div:first").text()},
      method: 'POST'
    }).then(function (resp) {
    if(resp.response =="push"){
        mySpan.text(parseInt(mySpan.text())+1);
    }else{
        mySpan.text(parseInt(mySpan.text())-1);
    }
    },function (err) {
      console.error(err);
    });
});

 $(document).on("click", ".close",function(){
     $.ajax({
      url: '/delete',
      data: {"username":$("#btnUserName").text(),
             "desc":$(this).parents(".grid-item").children("div:first").text()},
      method: 'POST'
    }).then(function (resp) {
    console.log(resp);
       $(".grid").empty();
            cnt=0;
        $(".w3-spin").css("display","block");
        $.ajax({
          url: '/retrieveSp',
          data:{"username":$('#btnUserName').text()},
          method: 'POST'
        }).then(function (response) {
                $(".w3-spin").css("display","none");
            console.log(response);
         for(var i =0;i<response.length;i++){
             addCartAll(response[i],true);
         }
    
        },function (e) {
          console.error(e);
        });
    },function (err) {
      console.error(err);
    }); 
 });  

  