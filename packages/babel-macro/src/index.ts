/// <reference path="references.d.ts" />
import { BabelTransformer } from "@typescript-nameof/babel-plugin";
import { BabelContext } from "@typescript-nameof/babel-plugin/src/Transformation/BabelContext";
import { UnusedInterpolationError } from "@typescript-nameof/common";
import { INameOfProvider } from "@typescript-nameof/common-types";
import { createMacro, MacroError } from "babel-plugin-macros";

const nameof: INameOfProvider = createMacro(nameofMacro);
// eslint-disable-next-line import/no-default-export
export default nameof;

/**
 * Transforms `nameof` calls.
 *
 * @param context
 * The context of the macro.
 */
// @ts-ignore
function nameofMacro(context: any): void
{
    let transformer = new BabelTransformer(context.babel);

    let transformerContext: BabelContext = {
        state: context.state,
        interpolationCalls: []
    };

    // go over in reverse as if traversing in post order
    const reverseDefault = context.references.default.slice().reverse();

    // @ts-ignore
    reverseDefault.forEach(path =>
    {
        transformer.TransformNode(
            getPath(),
            {
                ...transformerContext,
                nameofIdentifierName: path.node.name
            });

        /**
         * Gets the path to the node to transform.
         *
         * @returns
         * The path to the node to transform.
         */
        function getPath(): any
        {
            const parentPath = path.parentPath; // identifier;

            if (parentPath.type === "CallExpression")
            {
                return parentPath;
            }

            const grandParentPath = parentPath.parentPath;

            if (parentPath.type === "MemberExpression" && grandParentPath.type === "CallExpression")
            {
                return grandParentPath;
            }

            throw new MacroError(`[ts-nameof]: Could not find a call expression at path: ${grandParentPath.getSource()}`);
        }
    });

    let remainingCall = context.interpolationCalls?.[0];

    if (remainingCall)
    {
        throw new UnusedInterpolationError(transformer.Transformer, remainingCall, context);
    }
}
