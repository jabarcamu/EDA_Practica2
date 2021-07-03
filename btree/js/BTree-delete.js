class BTreeNode {
  constructor(isLeaf) {    
    this.values = [];    
    this.leaf = isLeaf;    
    this.children = [];    
    this.tree = null; 
    this.parent = null;
  }

  // Transformar a formato JSON el arbol para mostrarlo en el entorno grafico
  toJSON()  {
      var json = {};
      json.name = this.values.toString();
      //if (!thi.isRoot()) json.parent = this.parent.keys.toString();
      if (!this.leaf) {
        json.children = [];
        this.children.forEach(function(child, index){
          json.children.push(child.toJSON());
        });
      }
      return json;
  } 

  //Numero de valores
  get n() {
    return this.values.length;
  }

  //anhadir valor
  addValue(value) {
    if (!value) {
      return;
    }
    let pos = 0;
    while (pos < this.n && this.values[pos] < value) {
      pos++;
    }
    this.values.splice(pos, 0, value);
  }

  // borrar un valor y ponerlo en su posicion
  removeValue(pos) {
    if (pos >= this.n) {
      return null;
    }
    return this.values.splice(pos, 1)[0];
  }

  //agragar hijo en la posicion pos
  addChild(node, pos) {
    this.children.splice(pos, 0, node);
    node.parent = this;
  }
  //Borrar el nodo de la posicion y borrarlo
  deleteChild(pos) {
    return this.children.splice(pos, 1)[0];
  }
}

//Arbol B - BTree principal
class BTree {
  constructor(order) {    
    this.order = order;    
    this.root = null; // la raiz que sera de tipo BNodeTree
  }

  //Buscar un valor en el arbol y retornar el nodo  
  searchValue(node, value) {
    if (node.values.includes(value)) {
      return node;
    }
    if (node.leaf) {
      // Value was not found
      return null;
    }
    let child = 0;
    while (child <= node.n && node.values[child] < parseInt(value, 10)) {
      child++;
    }
    return this.searchValue(node.children[child], value);
  }
    
  //Borrar el valor del arbol
  delete(value) {
    if (this.root.n === 1 && !this.root.leaf &&
      this.root.children[0].n === this.order-1 && this.root.children[1].n === this.order -1) {
      // Verifica si la raiz puede reducir el arbol dentro de sus hijos
      this.mergeNodes(this.root.children[1], this.root.children[0]);
      this.root = this.root.children[0];
    }
    // Inicio de busqueda del valor a borrar
    this.deleteFromNode(this.root, parseInt(value, 10));
  }

  // Borrar un valor de un nodo
  deleteFromNode(node, value) {
    // Verifica si el valor esta en el nodo
    const index = node.values.indexOf(value);
    if (index >= 0) {
      // Valor presente en el nodo 
      if (node.leaf && node.n > this.order - 1) {
        // si el nodo es una hoja y tiene mas orden-1 valores, solo borrarlo
        node.removeValue(node.values.indexOf(value));
        return true;
      }
      // Verificar si algun hijo tiene los suficientes valores a transferir
      if (node.children[index].n > this.order - 1 ||
        node.children[index + 1].n > this.order - 1) {
        // Uno de los hijos inmediatos tiene los suficientes valores para transferir
        if (node.children[index].n > this.order - 1) {
          // Reemplazar el valor objetivo por el mayor del nodo izquierdo
          // Luego Borrar el valor del hijo
          const predecessor = this.getMinMaxFromSubTree(node.children[index], 1);
          node.values[index] = predecessor;
          return this.deleteFromNode(node.children[index], predecessor);
        }
        const successor = this.getMinMaxFromSubTree(node.children[index+1], 0);
        node.values[index] = successor;
        return this.deleteFromNode(node.children[index+1], successor);
      }
      // Hijos no tiene los sufientes valores para transferir. Realizar Merge o juntarlos
      this.mergeNodes(node.children[index + 1], node.children[index]);
      return this.deleteFromNode(node.children[index], value);
    }
    //Valor  no esta presente en el nodo
    if (node.leaf) {
      // valor no esta en el arbol
      return false;
    }
    // Valor no esta presente en el nodo, buscar en el hijo
    let nextNode = 0;
    while (nextNode < node.n && node.values[nextNode] < value) {
      nextNode++;
    }
    if (node.children[nextNode].n > this.order - 1) {
      // Nodo hijo tiene los suficientes valores para continuar
      return this.deleteFromNode(node.children[nextNode], value);
    }
    // Hijo nodo no tiene los suficientes valores para continuar
    // Antes de visitar el siguiente nodo a transferir un valor o Merge con su hermano
    if ((nextNode > 0 && node.children[nextNode - 1].n > this.order - 1) ||
      (nextNode < node.n && node.children[nextNode + 1].n > this.order - 1)) {
      // One of the immediate children has enough values to transfer
      if (nextNode > 0 && node.children[nextNode - 1].n > this.order - 1) {
        this.transferValue(node.children[nextNode - 1], node.children[nextNode]);
      } else {
        this.transferValue(node.children[nextNode + 1], node.children[nextNode]);
      }
      return this.deleteFromNode(node.children[nextNode], value);
    }
    // el hermano que no es inmediato con los sufientes valores  No immediate brother with enough values.
    // Merge al nodo con el hermano inmediato
    this.mergeNodes(
      nextNode > 0 ? node.children[nextNode - 1] : node.children[nextNode + 1],
      node.children[nextNode]);
    return this.deleteFromNode(node.children[nextNode], value);
  }

  //Transferir un valor desde el origen al objetivo   
  transferValue(origin, target) {
    const indexo = origin.parent.children.indexOf(origin);
    const indext = origin.parent.children.indexOf(target);
    if (indexo < indext) {
      target.addValue(target.parent.removeValue(indexo));
      origin.parent.addValue(origin.removeValue(origin.n-1));
      if (!origin.leaf) {
        target.addChild(origin.deleteChild(origin.children.length-1), 0);
      }
    } else {
      target.addValue(target.parent.removeValue(indext));
      origin.parent.addValue(origin.removeValue(0));
      if (!origin.leaf) {
        target.addChild(origin.deleteChild(0), target.children.length);
      }
    }
  }

  // Juntar o Merge 2 nodos en uno con el madre de valor medio   
  mergeNodes(origin, target) {
    const indexo = origin.parent.children.indexOf(origin);
    const indext = target.parent.children.indexOf(target);
    target.addValue(target.parent.removeValue(Math.min(indexo, indext)));
    for (let i = origin.n - 1; i >= 0; i--) {
      target.addValue(origin.removeValue(i));
    }
    //Remover la referencia al nodo origen
    target.parent.deleteChild(indexo);
    //  Transferir todos los hijos desde el nodo origen al objetivo
    if (!origin.leaf) {
      while (origin.children.length) {
        if (indexo > indext) {
          target.addChild(origin.deleteChild(0), target.children.length);
        } else {
          target.addChild(origin.deleteChild(origin.children.length - 1), 0);
        }
      }
    }
  }
  
  //Obtener el menor y mayor valor en el subarbol   
  getMinMaxFromSubTree(node, max) {
    while (!node.leaf) {
      node = node.children[max ? node.n : 0];
    }
    return node.values[max ? node.n - 1 : 0];
  }

  //Insertar un nuevo valor en el arbol
  insert(value) {
    const actual = this.root;
    if (actual.n === 2 * this.order - 1) {
      // Crear un nuevo nodo para que sea la raiz
      // Anexar la raiz anterior al nuevo
      const temp = new BTreeNode(false);
      temp.tree = this;
      this.root = temp;
      temp.addChild(actual, 0);
      this.split(actual, temp, 1);
      this.insertNonFull(temp, parseInt(value, 10));
    } else {
      this.insertNonFull(actual, parseInt(value, 10));
    }
  };

  //Dividir el nodo hijo desde el padre dentro de parent.values[pos-1] y parent.values[pos]  
  split(child, parent, pos) {
    const newChild = new BTreeNode(child.leaf);
    newChild.tree = this.root.tree;
    // Crear un nuevo Hijo
    // Pasar Valores desde el hijo anterior al nuevo
    for (let k = 1; k < this.order; k++) {
      newChild.addValue(child.removeValue(this.order));
    }
    // Traspasar nodos hijo desde el hijo anterior al nuevo
    if (!child.leaf) {
      for (let k = 1; k <= this.order; k++) {
        newChild.addChild(child.deleteChild(this.order), k - 1);
      }
    }
    // Agregar un nuevo hijo al padre
    parent.addChild(newChild, pos);
    // Pasar el valor al padre
    parent.addValue(child.removeValue(this.order - 1));
    parent.leaf = false;
  }

  // Insertar un valor en un nodo no lleno   
  insertNonFull(node, value) {
    if (node.leaf) {
      node.addValue(value);
      return;
    }
    let temp = node.n;
    while (temp >= 1 && value < node.values[temp - 1]) {
      temp = temp - 1;
    }
    if (node.children[temp].n === 2 * this.order - 1) {
      this.split(node.children[temp], node, temp + 1);
      if (value  > node.values[temp]) {
        temp = temp + 1;
      }
    }
    this.insertNonFull(node.children[temp], value);
  }

  // Iniciar con numeros aleatorios al arbol
  seed(count) {
    var list = [];
  
    var upper = 100;
    if (count > 50) upper = count*2;
  
    for(var i=1; i<upper; i++) list.push(i);
  
    for(var i=0; i<count; i++) {
      list.sort(function(a,b){ return Math.floor(Math.random() * 3) - 1; })
      var current = list.shift();
      this.insert(current);
    }
  
  }
 
}
