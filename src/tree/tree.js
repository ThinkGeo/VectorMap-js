import { TreeNode } from "./treeNode";

class Tree {

    constructor(node, treeIndex) {
        this.node = node;
        this.root = node;
        this.treeIndex = treeIndex;
    }

    traverseNode(callback, select) {
        (function recurse(currentNode) {
            if (callback(currentNode)) {
                if (currentNode.children.length > 0) {
                    var hasMatchedChildren = false;
                    for (var i = 0, length_1 = currentNode.children.length; i < length_1; i++) {
                        if (recurse(currentNode.children[i])) {
                            hasMatchedChildren = true;
                            break;
                        }
                    }
                }
                else {
                    // current node is matched, and without children
                    select(currentNode);
                }
                // true: the currentNode is matched.
                return true;
            }
            // false: the currentNode is not matched.
            return false;
        })(this.root);
    }
}
export default Tree;