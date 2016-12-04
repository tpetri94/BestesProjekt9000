$(document).ready( function() {

    jQuery("#start-button").on('click', function(event) {
        $("#modal-1").modal({show: true});
    });

    jQuery("#but-1").on('click', function(event) {
        $.ajax({
            type: "POST",
            url: "/userdata",
            data: {
                "_id": $("#usrn").val(),
                "data": { "username": $("#usrn").val(), "hof": $("#hof").val(), "location": $("#loc").val(),
                "email": $("#email").val(), "password": $("#psw").val() }
            },
            success: function(err, res) { console.log(res); },
            dataType: "json"
        });
        $("#modal-2").modal({show: true});
    });

    $("#but-2").on('click', function(event) { 
        $("#modal-3").modal({show: true});
    });

    $('#but-3').on('click', function(event) { 
        // Home Page
        document.location = '/main';
        $('body').addElement()
    });

    $('.advanced-toggle').on('click', function(event) {
        $('#advanced-data').collapse('toggle');
    });

    $('.hexagon').each(function(index, obj) {
        $(obj).on('click', function(event) {
          $('#field-name').html($(obj).attr('id'));
          var $crop = $('#field-desc > img');
          var $crop_name = $('#field-desc > span');

          switch($(obj + ' > .field-values').text()) {
            case '0':
                $crop_name.text('Mais');
                $crop.attr('src', '../images/mais.png');
            case '1':
                $crop_name.text('Weizen');
                $crop.attr('src', '../images/weizen.png');
            case '2':
                $crop_name.text('Rüben');
                $crop.attr('src', '../images/rueben.png');
          }
      });
    });

    $('.category').each(function(index, obj) {
        $(obj).on('click', function(event) {

            var machine = jQuery('#machine-' + (index+1));
            var image = jQuery('#c' + (index+1));

            machine.attr('src', image.attr('src'));
            machine.attr('width', image.attr('width'));
            machine.attr('height', image.attr('height'));

            var label = jQuery('#label' + (index+1));
            var value = label.text().trim().split(" ");

            if (value.length == 1) {
                label.text(" x 1");
            } else {
                value[1] = (parseInt(value[1]) + 1).toString();
                label.text(' ' + value[0] + ' ' + value[1]);
            }
        });
    });

});