export class TreeNode<T> {
    data: T;
    children: Array<TreeNode<T>>;

    constructor(data: T) {
        this.data = data;
        this.children = [];
    }
}