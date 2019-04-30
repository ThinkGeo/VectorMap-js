import { TreeNode } from "./treeNode";

export class Tree<T> {
    node: TreeNode<T>;
    root: TreeNode<T>;
    treeIndex: number;

    constructor(node: TreeNode<T>, treeIndex) {
        this.node = node;
        this.root = node;
        this.treeIndex = treeIndex;
    }

    traverseNode(callback, select) {
        (function recurse(currentNode) {

            if (callback(currentNode)) {
                if (currentNode.children.length > 0) {
                    for (let i = 0, length = currentNode.children.length; i < length; i++) {
                        if (recurse(currentNode.children[i])) {
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