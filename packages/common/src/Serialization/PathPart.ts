import { IIdentifier } from "./IIdentifier";
import { IIndexAccessor } from "./IIndexAccessor";
import { IInterpolation } from "./IInterpolation";
import { IPropertyAccessor } from "./IPropertyAccessor";

/**
 * Represents the path of an accessor path.
 */
export type PathPart<T> =
    IIdentifier<T> |
    IPropertyAccessor<T> |
    IIndexAccessor<T> |
    IInterpolation<T> |
    UnsupportedNode<T>;
