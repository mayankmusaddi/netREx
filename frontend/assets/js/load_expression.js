function load_expression(data){
      // define arguments object
      var args = {
        root: '#expressionchart',
        'network_data': data,
        'sidebar_width':150,
        'col_label_scale': 1.25,
        'ini_expand': true,
      };

      resize_container(args);

      d3.select(window).on('resize',function(){
        resize_container(args);
        cgm.resize_viz();
      });

      cgm = Clustergrammer(args);

    $('.col_slider_group').attr('display','none');
    $('.row_slider_group').attr('display','none');
    $('.expand_button').attr('display','none');

    $('.icons_section > .clust_icon > .fa.fa-camera.icon_buttons.sidebar_tooltip').appendTo('#expressionopts');
    $('.sidebar_wrapper > svg').appendTo('#expressionopts');
}


function resize_container(args){

  var screen_width = $('#expression-view').width();
  var screen_height = 300;

  d3.select(args.root)
    .style('width', screen_width+'px')
    .style('height', screen_height+'px');
}