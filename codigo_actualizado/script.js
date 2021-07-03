
function insertar_data(data_value){
    //alert("DATA:"+data_value);
    event.preventDefault();
    var value = parseInt( data_value );
    bTree.insert(value, true); // silently insert

    $("#input-add").val("");

    treeData = bTree.toJSON();
    console.log(treeData);
    update(treeData);

    // Make the current add node highlighted in red
    $("g text").each(function(index) {
        var bTreeNode = bTree.search(value);
        var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
            return d.name === bTreeNode.keys.toString();
        });

       // reset all links and nodes
       d3.selectAll('g.node').select('circle').style({stroke : '#ccc', fill: '#ffffff'});
       d3.selectAll('.link').style('stroke','#ccc');

       // color links and all intermediate nodes
       colorPath(bTreeNode);

       // color bottom node
       d3NodeTouched.select('circle').style({stroke : '#ff0000', fill: '#ffcccc'});
    });

    ga('send', 'event', 'tree', 'inserted value');
  }
  

  // get tree size
  var bodyRect = d3.select("body").node().getBoundingClientRect();
  var margin = {top: 40, right: 120, bottom: 500, left: 120},//botton:20
  width = bodyRect.width - margin.right - margin.left,
  height = bodyRect.height - margin.top - margin.bottom;

  // create the tree
  var treemap = d3.tree().size([width, height]);

  // var svg = d3.select("#canvas").append("svg")
  //     .attr("width", width + margin.right + margin.left)
  //     .attr("height", height + margin.top + margin.bottom)
  // console.log(svg)

  var svg = d3.select("#canvas").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bTree, treeData;

  // automatically create btree with default settings
  bTree = BTree(3);
  $("#order-display").html(4);
  bTree.seed(20);
  var treeData = bTree.toJSON();  

  console.log(treeData);

  update(treeData);

  // create form event handler
  $("#create-form").submit(function(event) {
    event.preventDefault();
    var order = parseInt( $("#new-order").val() );
    var seed = parseInt( $("#new-seed").val() );

    // set up btree
    bTree = BTree(order);
    bTree.seed(seed);

    $("#create-form").fadeOut(200, function() {
      $("#order-display").html(order);
      $("h1 .label").fadeIn(200);
      $("#add-form").fadeIn(200, function() {
        if (!bTree.isEmpty()) {
          $("#canvas").fadeIn(200);
          var treeData = bTree.toJSON();
          update(treeData);
        }
      });
    });

    ga('send', 'event', 'tree', 'generated');

  });
  
  
  

  // reset tree event handler
  $(".reset-btree").click(function(e) {
    e.preventDefault();
    $("#input-add").val("");
    $('svg g').children().remove();
    $("#canvas").fadeOut(200);
    $("h1 .label").fadeOut(200);
    $("#add-form").fadeOut(200, function(){
      $("#create-form").fadeIn(200);
    });

    ga('send', 'event', 'tree', 'reset');

  });

  // add integer event handler
  $("#add-form").submit(function(event) {
    event.preventDefault();
    var value = parseInt( $("#input-add").val() );
    bTree.insert(value, true); // silently insert

    $("#input-add").val("");

    treeData = bTree.toJSON();
    console.log(treeData);
    update(treeData);

    // Make the current add node highlighted in red
    $("g text").each(function(index) {
        var bTreeNode = bTree.search(value);
        var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
            return d.name === bTreeNode.keys.toString();
        });

       // reset all links and nodes
       d3.selectAll('g.node').select('circle').style({stroke : '#ccc', fill: '#ffffff'});
       d3.selectAll('.link').style('stroke','#ccc');

       // color links and all intermediate nodes
       colorPath(bTreeNode);

       // color bottom node
       d3NodeTouched.select('circle').style({stroke : '#ff0000', fill: '#ffcccc'});
    });

    ga('send', 'event', 'tree', 'inserted value');

  });
  
  
  


    //var gen_run_tiempo_parcial = null;
    //clearInterval(gen_run_tiempo_parcial);
    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }

   function colorPath(node){
       
        //*** Color del Nodo
        d3.selectAll('g.node').filter(function(d){
        return d.data.name === node.keys.toString();
        }).select('circle').style('stroke','red');
        //*** Recorrer Arbol
        if(node.isRoot())return;
        else{
            //*** Filtrar Contenido de Links
            d3.selectAll('.link').filter(function(d){
                return d.data ? d.data.name === 
                        node.keys.toString() : d.data.name === 
                        node.keys.toString();
            }).style('stroke','red');//'steelblue');

            return colorPath(node.parent);
        }
   }

  
  
  // update d3 visualization
  function update(source) {
    
    // Make source data into d3-usable format
    //var g =d3.select("body").append("svg").append("g")
    // create a hierarchy from the root
    var nodes = d3.hierarchy(source)
    //nodes = treemap(nodes);    
    // nodes
    nodes = treemap(nodes);
    // links
    //const links = treeRoot.links()    

    svg.selectAll(".link").remove();
    svg.selectAll(".node").remove();
    
    var links = svg.selectAll(".link")
    .data( nodes.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        return "M" + d.x + "," + d.y
          + "C" + d.x + "," + (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," + d.parent.y;
        });
    //console.log(links);

    // var nodeEnter = node.enter().append("g")
    // .attr("transform", function(d) {      
    //   return "translate(" + d.x + "," + d.y + ")"; 
    // })
    // .attr("class","node")
    // .attr( "id", function( i, id ) {
    //   return 'i'+id;
    // });

    var nodeEnter = svg.selectAll(".node")
    .data(nodes.descendants())
    .enter().append("g")
      .attr("class", function(d) { 
        return "node" + 
          (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; }).attr( "id", function( i, id ) {
          return 'i'+id;
        });
    
    //var nodes = tree.nodes(source);
    //var links = tree.links(nodes);

    // Normalize for fixed-depth.
    //nodes.descendants().forEach(function(d) { d.y = d.depth * 100; });


    // NODE SELECTION
     var i = 0;
     var node = svg.selectAll("g.node")
       .data(nodes, function(d) { return d.id || (d.id = ++i); });    

    // NODE POINT
    nodeEnter.append("circle")
      .attr("r", 5)
      .style("fill", "white")
      .style('opacity',0).transition()
      .style('opacity',1).duration(250);

    // UPDATE NODE DATA + POSITION
    node.each(function(d,i){
        //*** DIBUJAR CIRCULOS EN LAS POSICIONES
        var nodo_act = d3.select('#'+this.id);
        var tex = d.data.name;
        var arr = tex.split(',');
        var array = [];
        var cx, cy;
        //*** Recorrer String Interno
        for(var i=0; i<arr.length; i++){
            //*** ADD CIRCULO
            nodo_act.append("circle")
                .attr("cx", i*15+i*15-((arr.length-1)*15))
                .attr("cy", 20).attr("r", 15)
                .style("fill", "yellow");
            //*** ADD TEXTO
            nodo_act.append("text")
                    .text(arr[i])
                    .attr('transform', 'translate(' + 
                        pos_tex_3d(arr[i],i,arr.length) 
                        + ',' + (25) + ')');
        }
    });
     
    // D3 LINKS
    
    // var diagonal = d3.line()
    // .x(function(d) { return x(d.x); })
    // .y(function(d) { return y(d.y); });
    //   //.projection(function(d) { return [d.x, d.y]; });
    // links.enter().insert("path", "g")
    //   .attr("class", "link")
    //   .attr("d", diagonal);

    // links.each(function(d,i) {
    //   debugger;
    //   var thisLink = d3.select(svg.selectAll("path.link")._groups[0][i]);
    //   diagonal = d3.line()
    //     .x(function(d) { return x(d.x); })
    //     .y(function(d) { return y(d.y); });
    //   thisLink.transition().attr("d", diagonal);
    // });
  }
  
  function pos_tex_3d(tex, i, tam){
      if(tex.length==1)return(i*15+i*15-((tam-1)*15)-3);
      if(tex.length==2)return(i*15+i*15-((tam-1)*15)-6);
      return(i*15+i*15-((tam-1)*15)-9);
  }
  

