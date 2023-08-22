// eslint-disable-next-line node/no-unpublished-import
import type { Node, PluginPass } from "@babel/core";
import { ITransformationContext } from "@typescript-nameof/common";

/**
 * Represents the context of a `babel` transformation.
 */
export type BabelContext = ITransformationContext<Node> & {
    /**
     * The state of the plugin.
     */
    state: PluginPass;

    /**
     * Action to prompt the children to be traversed. This is to allow traversing the nodes in post order.
     */
    traverseChildren?: () => void;

    /**
     * Expected identifier name at the start of the call expression. This could be different when using a macro.
     *
     * @default "nameof"
     */
    nameofIdentifierName?: string;
};