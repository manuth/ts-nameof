import { NodeKind } from "./NodeKind";
import { ParsedNode } from "./ParsedNode";
import { PathPart } from "./PathPart";

/**
 * Represents a node.
 */
export abstract class Node<T>
{
    /**
     * The type of the node.
     */
    public abstract readonly Type: NodeKind;

    /**
     * The source of the node.
     */
    private source: T;

    /**
     * Initializes a new instance of the {@linkcode Node} class.
     *
     * @param source
     * The source of the node.
     */
    public constructor(source: T)
    {
        this.source = source;
    }

    /**
     * Gets the source of the node.
     */
    public get Source(): T
    {
        return this.source;
    }

    /**
     * Gets the expression path component of this node.
     */
    public get PathPart(): PathPart<T>
    {
        return {
            type: PathKind.Unsupported,
            source: this.Source
        };
    }

    /**
     * The full path of the node.
     */
    public get Path(): Array<PathPart<T>>
    {
        return [this.PathPart];
    }

    /**
     * Gets the root of the node.
     */
    public get Root(): ParsedNode<T>
    {
        return new UnsupportedNode(this.Source);
    }
}
