//funciones para cualquier nodo del arbol


// constructor
// don't call this directly, call BTree::createNode instead
var BTreeNode = function(tree, keys, children, parent){
	var newNode = Object.create(BTreeNode.prototype);
	newNode.tree = tree;
	newNode.keys = keys || [];
	newNode.children = children || []; // apparently fixed arrays are bad in JS
	newNode.parent = parent || null;

	return newNode;
}

// Traverse tree until we find correct node to insert this value
// strict=true searches for node containing exact value
BTreeNode.prototype.traverse = function(value, strict) {
	if (this.keys.indexOf(value) > -1) return this;
	else if (this.isLeaf()) {
		if (strict) return false;
		else return this;
	}
	else { // find the correct downward path for this value
		for(var i = 0; i < this.keys.length; i++){
			if(value < this.keys[i]){
				return this.children[i].traverse(value, strict);
			}
		}
		return this.children[this.keys.length].traverse(value, strict);
	}
}

//COnseguir el maxmimo valor del arbol
BTreeNode.prototype.getMaximo = function(){
	//debugger;
	var currentNode = this;
	while(!currentNode.isLeaf()){
		//caso iterativo
		currentNode =  currentNode.children[currentNode.keys.length];
		//return children[this.keys.length].getMaximo();
	}
	return currentNode;

}

//COnseguir el minimo valor del arbol
BTreeNode.prototype.getMinimum = function(){
	//debugger;
	var currentNode = this;
	while(!currentNode.isLeaf()){
		//caso iterativo
		currentNode =  currentNode.children[0];
	}
	return currentNode;

}

BTreeNode.prototype.insert = function(value){

	var int = parseInt(value) || 0;
	if ( int <= 0 || int > 1000000000000 ) {
		alert('Please enter a valid integer.');
		return false;
	}

	// insert element
	this.keys.push(value);
	//con el sort el item es insertado en la correcta posiciones
	//al interior del vector keys
	this.keys.sort(function(a,b){ // sort numbers ascending
		if(a > b) return 1;
		else if(a < b) return -1;
		else return 0;
	})
	
	//balanceo
	// if overflow, handle overflow (go up)
	if(this.keys.length === this.tree.order) {
		//desvinculo mis hijos y mi padre
		//e inserto en mi padre el nodo mitad
		this.handleOverflow();
	} else { // if not filled, start attaching children
		//si el padre me permite insertar elmento
		//desciendo en el arbol vinculando todos mis hijos
		//con la nueva divisiones ya incorporadas
		this.attachChildren();
	}
}

BTreeNode.prototype.deleteKey = function(value) {
	var valDel = this.keys.indexOf(value);
	var parentDel = this.parent;
	var childrenDel = this.parent.children;
	var childrenTam = childrenDel.length;  

	var indexDel = -1;
	//en el vector de hijos (entre todos mis hermanos y yo
	//saber en que hijo esta ubicado el valor a eliminar
	for(var i= 0 ; i < childrenDel.length ; i++) {
		if(this.buscarKey(childrenDel[i].keys,value)) {
			indexDel=i;
		}
	}

	//eliminamos el hijo	
	this.keys.splice(valDel,1);
	
	//extranio dividir por dos al order del arbol como minima cantidad
	if(this.keys.length < Math.ceil((this.tree.order) / 2) - 1) {

		debugger;
		// padre y hermano para intercambio
		//
		// en caso se der un unico valor
		if(indexDel === 0)  {
			//var tamHermano =  childrenDel[indexDel+1].keys.length;
			//genial conseguir la primera key del hermano
			var keyParent = this.buscarKeyParent(parentDel.keys, value, childrenDel[indexDel+1].keys[0])

			//insertar una key en el sibling con la clave ya encontrada del padre
			childrenDel[indexDel+1].keys.push(keyParent);
			var parentIndex = parentDel.keys.indexOf(keyParent);
			//quitamos el respectivo key del padre
			parentDel.keys.splice(parentIndex,1);
			
			//para reordenar los keys con ya el key insertado en el sibling
			childrenDel[indexDel+1].keys.sort(function(a,b){ // sort numbers ascending
				if(a > b) return 1;
				else if(a < b) return -1;
				else return 0;
			});
			
			//quitamos el hijo que contenia la key y que poseia un valor
			//ya limite inferior de numero de keys
			childrenDel.splice(indexDel,1);

		}
		else {
			//en caso que sea un indice a eliminar mayor a cero
			//es decir exista aun numero de keys aceptable
		}

		console.log(this, "menor al order");
	}
	else {
		console.log(this, "lo retira porque no causa problema")
	}

}


//buscando una key en el nodo actual representado por array
BTreeNode.prototype.buscarKey = function(arr, value) {
	for(var i = 0 ; i < arr.length ; i++) {
		if(arr[i] === value) 
			return true;
	}
	return false;
}

//buscar una key en el nodo padre con 
BTreeNode.prototype.buscarKeyParent = function(arr, value1, value2) {
	for(var i = 0 ; i < arr.length ; i++) {
		//genial solo buscar mucho antes de mi hermano 
		//ya que el padre podra tener mas keys que apunten a los hermanos
		//del sibling
		if(arr[i] >= value1 && arr[i] <= value2) 
			return arr[i];
	}  
}

//balanceo por eliminacion TODO
BTreeNode.prototype.handleUnderflow = function() {
	tree = this.tree;

	// encontrar el nodo mitad
	// desvincula la parte izquierda y derecha del nodo actual
	median = this.splitMedian();

	// if no parent, create an empty one and set to root
	if(this.isRoot()) {
		tree.root = tree.createNode();
		this.setParent(tree.root);
	}

	// if node is internal, unattach children and add to unattached_nodes
	if (this.isInternal()) this.unattachAllChildren();

	// remove self from parent
	target = this.parent;
	this.unsetParent();

	// Push median up to target, increment offset
	tree.current_leaf_offset += 1;
	target.insert(median);
}

BTreeNode.prototype.handleOverflow = function() {
	tree = this.tree;

	// find this node's median and split into 2 new nodes
	median = this.splitMedian();

	// if no parent, create an empty one and set to root
	if(this.isRoot()) {
		tree.root = tree.createNode();
		this.setParent(tree.root);
	}

	// if node is internal, unattach children and add to unattached_nodes
	// en caso de ser un segundo nivel a mas de overflow
	// desvincula hijos y los añade ya con los nodos que fueron spliteados
	// de manera ordenada
	if (this.isInternal()) this.unattachAllChildren();

	// remove self from parent
	target = this.parent;
	this.unsetParent();

	// Push median up to target, increment offset
	tree.current_leaf_offset += 1;
	
	//llamado recursivo
	target.insert(median);
}

// function to go down and reattach nodes
BTreeNode.prototype.attachChildren = function() {
	var target = this;
	var offset = target.tree.current_leaf_offset-1;

	// get all nodes below the current node
	var target_nodes = target.tree.unattached_nodes[offset];

	if (target_nodes && target_nodes.length > 0) {
		// first, put all existing nodes into target_nodes so they're ordered correctly
		// una ultima desvinculada del nodo median insertado (sin overflow)
		// permite ordenarlo con los hijos separados (izquierda y derecha) 
		// y los hijos restantes desvinculados (todos de manera ordenada)
		
		//en teoria ya fueron ordenado durante el overflow
		//pero es necesario para el primero nodo que acepto el median
		target.unattachAllChildren();

		// then, attach keys.length+1 children to this node
		for(var i=0; i<=target.keys.length; i++) {
			target.setChild(target_nodes[0]);
			target.tree.removeUnattached(target_nodes[0], offset);
		}

		// lower offset, and repeat for each one of the children
		tree.current_leaf_offset -= 1;
		target.children.forEach(function(child) {
			child.attachChildren();
		});

		// come back up so upper levels can process appropriately
		tree.current_leaf_offset +=1;
	}
}

// helper function to split node into 2 and return the median
BTreeNode.prototype.splitMedian = function() {
	var median_index = parseInt(tree.order/2);
	var median = this.keys[median_index];
	
	//separamos las keys izquierdas
	var leftKeys = this.keys.slice(0,median_index);
	//creamos un nodo con las key izquierdas
	var leftNode = tree.createNode(leftKeys); // no children or parent
	//agregamos a nodos no vinculados en el actual nivel
	tree.addUnattached(leftNode, tree.current_leaf_offset);
	
	//separamos keys derechas
	var rightKeys = this.keys.slice(median_index+1, this.keys.length);
	//creamos el nodo con keys derechas
	var rightNode = tree.createNode(rightKeys);
	//desvinculamos al los nodos derechas
	tree.addUnattached(rightNode, tree.current_leaf_offset);
	return median;
}


BTreeNode.prototype.setChild = function(node) {
	if (node) {
		this.children.push(node) ;
		//necesario?
		node.parent = this;
	}
}


BTreeNode.prototype.unattachAllChildren = function() {
	var length = this.children.length;
	for(var i=0; i<length; i++){
		//siempre sera cero ya que el hijo se desvincula del padre
		child = this.children[0];
		child.unsetParent();
		//nivel -1 por quitar la fila de hijos actual
		tree.addUnattached(child, tree.current_leaf_offset-1);
	}
}

BTreeNode.prototype.setParent = function(node) {
	node.setChild(this);
}

BTreeNode.prototype.unsetParent = function() {
	//elimina los vinculos de padre a hijo y de hijo a padre
	var node = this;
	if (node.parent) {
		node.parent.children.forEach(function(child, index){
			if (child === node) node.parent.children.splice(index, 1);
		});
		node.parent = null;
	}
}


BTreeNode.prototype.isRoot = function() {
	return this.parent === null;
}


BTreeNode.prototype.isLeaf = function() {
	return (!this.children) || this.children.length === 0;
}


BTreeNode.prototype.isInternal = function() {
	return !this.isLeaf() && !this.isRoot();
}


// generate node json, used in BTree::toJSON
BTreeNode.prototype.toJSON = function() {
	var json = {};
	json.name = this.keys.toString();
	if (!this.isRoot()) json.parent = this.parent.keys.toString();
	if (!this.isLeaf()) {
		json.children = [];
		this.children.forEach(function(child, index){
			json.children.push(child.toJSON());
		});
	}
	return json;
}
