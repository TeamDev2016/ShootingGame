jQuery(function($) {
    $(document).ready(function(){
        $(".flash").click(function(e){
            location.href = '/game';
        });

        $(".fade").addClass('fade').on('webkitAnimationEnd mozAnimationEnd oAnimationEnd oanimationend animationend', function(){
             $("#loading").css("visibility", "hidden");
             $("#wrapper").css("visibility", "visible");
        });
    });
});
