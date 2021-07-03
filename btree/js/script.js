$(function() {
  // get tree size
  var bodyRect = d3.select("body").node().getBoundingClientRect();
  var margin = {top: 40, right: 120, bottom: 20, left: 120},
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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var bTree, treeData;

  // automatically create btree with default settings
  //bTree = BTree(3);
  //$("#order-display").html(3);
  //bTree.seed(5);
  var tree = null;
  bTree = new BTree(2);

  //bTree = new BTree(2);
  
  bTree.root = new BTreeNode(true);
  bTree.root.tree = this.tree;

  var list = [];

  var count = 0;
  upper = 100;
  if (count > 50) upper = count*2;

  for(var i=1; i<upper; i++) list.push(i);

  for(var i=0; i<count; i++) {
    list.sort(function(a,b){ return Math.floor(Math.random() * 3) - 1; })
    current = list.shift();
    bTree.insert(current);
  }

  var treeData = bTree.root.toJSON();  

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
    bTree.insert(value); // silently insert

    $("#input-add").val("");

    //treeData = bTree.toJSON();
    treeData = bTree.root.toJSON();
    console.log(treeData);
    update(treeData);

    // Make the current add node highlighted in red
    // $("g text").each(function(index) {
    //   var bTreeNode = bTree.search(value);
    //   var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
    //     return d.name === bTreeNode.keys.toString();
    //   });

    //   // reset all links and nodes
    //   d3.selectAll('g.node').select('circle').style({stroke : '#ccc', fill: '#ffffff'});
    //   d3.selectAll('.link').style('stroke','#ccc');

    //   // color links and all intermediate nodes
    //   //colorPath(bTreeNode);

    //   // color bottom node
    //   d3NodeTouched.select('circle').style({stroke : '#ff0000', fill: '#ffcccc'});
    // });

    //ga('send', 'event', 'tree', 'inserted value');

  });

  $("#delete-form").submit(function(event) {
    event.preventDefault();
    var value = parseInt( $("#input-delete").val() );
    
    bTree.delete(value); // silently insert

    $("#input-delete").val("");

    //treeData = bTree.toJSON();
    treeData = bTree.root.toJSON();
    console.log(treeData);
    update(treeData);

    // Make the current add node highlighted in red
    // $("g text").each(function(index) {
    //   var bTreeNode = bTree.search(value);
    //   var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
    //     return d.name === bTreeNode.keys.toString();
    //   });

    //   // reset all links and nodes
    //   d3.selectAll('g.node').select('circle').style({stroke : '#ccc', fill: '#ffffff'});
    //   d3.selectAll('.link').style('stroke','#ccc');

    //   // color links and all intermediate nodes
    //   //colorPath(bTreeNode);

    //   // color bottom node
    //   d3NodeTouched.select('circle').style({stroke : '#ff0000', fill: '#ffcccc'});
    // });

    //ga('send', 'event', 'tree', 'inserted value');

  });

  // color paths down to newly added node
  // function colorPath(node) {
  //   // color the node itself
  //   d3.selectAll('g.node').filter(function(d){
  //     return d.name === node.keys.toString();
  //   }).select('circle').style('stroke','steelblue');

  //   if (node.isRoot()) return;
  //   else {
  //     // filter for links that connect with this node
  //     d3.selectAll('.link').filter(function(d){
        
  //       return d.__data__ ? d.__data__.data.name === node.keys.toString() : d.data.name === node.keys.toString();
  //     }).style('stroke','steelblue');
  //     return colorPath(node.parent);
  //   }
  // }

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
    // var i = 0;
    // var node = svg.selectAll("g.node")
    //   .data(nodes, function(d) { return d.id || (d.id = ++i); });    

    // // NODE D3 APPENDING
    

    nodeEnter.append("circle")
      .attr("r", 10)
      .style("fill", "#fff").style('opacity',0).transition().style('opacity',1).duration(250);

    nodeEnter.append("text")
      .attr("y", function(d) {
        return d.children ? -18 : 18; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")            
      //.style('opacity',0).transition().style('opacity',1).duration(250)
      .text(function(d) { return d.data.name; })

    // // UPDATE NODE DATA + POSITION
    // node.each(function(d,i){
    //   var thisNode = d3.select('#'+this.id+' text');
    //   thisNode.text(d.name);
    //   d3.select('#'+this.id).transition().attr('transform', 'translate(' + d.x + ',' + d.y + ')')

    //   thisNode.attr("y", d.children || d._children ? -18 : 18);
    // });
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
});
