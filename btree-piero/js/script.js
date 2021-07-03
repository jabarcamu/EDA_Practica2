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

	var tree = null;
	var order = 3
	bTree = new BTree(order-1);

	$("#order-display").html(order);
	
	bTree.root = new BTreeNode(true);
	bTree.root.tree = tree;

	bTree.seed(15)

	var treeData = bTree.root.toJSON();

	console.log(treeData);

	update(treeData);

	// create form event handler
	$("#create-form").submit(function(event) {
		event.preventDefault();
		var order = parseInt( $("#new-order").val() );
		var seed = parseInt( $("#new-seed").val() );

		// set up btree

		var tree = null;		
		bTree = new BTree(order-1);
		
		bTree.root = new BTreeNode(true);
		bTree.root.tree = tree;
		
		bTree.seed(seed);

		$("#create-form").fadeOut(200, function() {
			$("#order-display").html(order);
			$("h1 .label").fadeIn(200);
			$("#add-form").fadeIn(200, function() {
			
				$("#canvas").fadeIn(200);
				var treeData = bTree.root.toJSON();
				update(treeData);
				
			});
			$("#max-min-form").fadeIn(200, function() {
				
				$("#canvas").fadeIn(200);
				var treeData = bTree.root.toJSON();
				update(treeData);
				
			});

		});

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
		$("#max-min-form").fadeOut(200, function(){
			$("#create-form").fadeIn(200);
		});

		

	});
	//conseguir el maximo elemento
	$(".max-btree").click(function(event){
		event.preventDefault();
		var nodeMax = bTree.getMax();
		//buscar el nodo de manera grafica que contenga al maximo

		var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
			return d.data.name === nodeMax.keys.toString();
		});

		// resetear estilos cuando cambie de accion
		d3.selectAll('g.node').select('circle').style('stroke','steelblue').style('fill','#fff');
		d3.selectAll('.link').style('stroke','#ccc');


		//resaltando el maximo nodo borde negro y relleno rojo
		d3NodeTouched.select('circle').attr("text-content","14px").style('stroke','#000').style('fill','#ff0000').style('fill-opacity','.50');


		// resaltar ruta cuando se busco el maximo valor
		colorPath(nodeMax);

		//sacamos el valor por input
		//TODo: encontrar de resaltar el name separado por ultimo o primer valor
		//diferentes estilos
		$("#max-min-value").val(String(nodeMax.keys[parseInt(nodeMax.keys.length)-1]));
		ga('send', 'event', 'tree', 'maximum value');
	});

	//conseguir el maximo elemento
	$(".min-btree").click(function(event){
		event.preventDefault();
		var nodeMin = bTree.getMin();

		//Buscar el nodo que contenga la clave de manera grafica
		var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
			return d.data.name === nodeMin.keys.toString();
		});

		// resetear los estilos cuando se cambio de accion
		d3.selectAll('g.node').select('circle').style('stroke','steelblue').style('fill','#fff');
		d3.selectAll('.link').style('stroke','#ccc');


		//resaltando el minimo nodo borde negro y relleno rojo
		d3NodeTouched.select('circle').style('stroke','#000').style('fill','#ff0000').style('fill-opacity','.50');

		// colorear enlaces y nodos de la ruta donde se busco el minimo
		//sacamos el valor por input
		//TODo: encontrar de resaltar el name separado por ultimo o primer valor
		//diferentes estilos
		$("#max-min-value").val(String(nodeMin.keys[parseInt(0)]));
		colorPath(nodeMin);

		ga('send', 'event', 'tree', 'minimum value');
	});



	//para las rutas anteriores de un nodo en particular (path)
	function colorPath(node) {
		// color the node itself
		d3.selectAll('g.node').filter(function(d){
			return d.data.name === node.keys.toString();
		}).select('circle').style('stroke','#0000ff');
		if (node.isRoot()) return;
		else {
			// filter for links that connect with this node
			d3.selectAll('.link').filter(function(d){

				return d.__data__ ? d.__data__.data.name === node.keys.toString() : d.data.name === node.keys.toString();
			}).style('stroke','steelblue');
			return colorPath(node.parent);
		}
	}



	// add integer event handler
	$(".insert-btree").click(function(event) {
		event.preventDefault();
		//llamada de insercion en el arbol B-Tree
		var value = parseInt( $("#input-add").val() );
		bTree.insert(value); // silently insert

		//limpiar entrada de valor
		$("#input-add").val("");

		//json enviado a D3
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

	$(".buscar-btree").click(function(event) {
		event.preventDefault();
		var value = parseInt( $("#input-add").val());	
		var itemFinded = bTree.search(value,true);
		if(itemFinded != false){

			//Buscar el nodo que contenga la clave de manera grafica
			var d3NodeTouched = d3.selectAll('g.node').filter(function(d){
				return d.data.name === itemFinded.keys.toString();
			});

			// resetear los estilos cuando se cambio de accion
			d3.selectAll('g.node').select('circle').style('stroke','steelblue').style('fill','#fff');
			d3.selectAll('.link').style('stroke','#ccc');
			$("#input-add").val("");//limpiar input
			
			//transformando texto
			var textNode = itemFinded.keys.toString();
			var idxItemSearched = itemFinded.keys.indexOf(value);
			var numCharsKey = String(itemFinded.keys[idxItemSearched]).length;
			var idxInicioCharItem = textNode.search(itemFinded.keys[idxItemSearched]);
			//el texto puede estar al medio y al final o al inicio
			//pero siempre captura tex
			var textAnt = textNode.slice(0,idxInicioCharItem-1);
			var tex = textNode.slice(idxInicioCharItem,idxInicioCharItem + numCharsKey);
			var textFin = textNode.slice(idxInicioCharItem + numCharsKey);

			var textBuscado = textAnt + "[" + tex+"]"+textFin;

			itemFinded.keys[idxItemSearched] = textBuscado;


			//actualizacion usando Json sobre D3
			treeData = bTree.toJSON();
			console.log(treeData);
			update(treeData);


			//resaltando el minimo nodo borde negro y relleno rojo
			d3NodeTouched.select('circle').style('stroke','#000').style('fill','#ff0000').style('fill-opacity','.50');

			colorPath(itemFinded);

			

			ga('send', 'event', 'tree', 'search value');
		}else{
			alert("el elemento buscado no se encuentra en el arbol");
		}
	});

	//Buscar un nodo y resaltarlo
	$(".borrar-btree").click(function(event) {
		//llamada de eliminacion de key del B-Tree
		event.preventDefault();
		var value = parseInt( $("#input-add").val() )
		bTree.delete(value); // silently insert

		$("#input-add").val("");

		//actualizacion usando Json sobre D3
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

		// Normalize for fixed-depth.
		//nodes.forEach(function(d) { d.y = d.depth * 100; });

		svg.selectAll(".link").remove();
		svg.selectAll(".node").remove();

		var links = svg.selectAll(".link")
			.data( nodes.descendants().slice(1))
			.enter().append("path")
			.attr("class", "link")
			.attr("d", function(d) {
				return "M" + d.x + "," + d.y/2
					+ "C" + d.x + "," + (d.y/2 + d.parent.y/2) / 2
					+ " " + d.parent.x + "," +  (d.y/2 + d.parent.y/2) / 2
					+ " " + d.parent.x + "," + d.parent.y/2;
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
				return "translate(" + d.x + "," + d.y/2 + ")"; }).attr( "id", function( i, id ) {
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
