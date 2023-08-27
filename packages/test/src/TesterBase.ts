import { strictEqual } from "assert";
import { ErrorHandler, IErrorHandler } from "@typescript-nameof/common";
import { Project } from "ts-morph";
import { INameofOutput } from "./INameofOutput.js";
import { TestErrorHandler } from "./TestErrorHandler.js";

/**
 * Provides the functionality to transform source code.
 *
 * @template T
 * The type of the node which are being transformed.
 */
export abstract class TesterBase<TNode, TContext>
{
    /**
     * A project for formatting code.
     */
    private project = new Project();

    /**
     * Gets a project for formatting code.
     */
    public get Project(): Project
    {
        return this.project;
    }

    /**
     * Transforms the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected async Transform(code: string): Promise<INameofOutput>
    {
        let output: string | undefined;
        let errorHandler = new TestErrorHandler(this.DefaultErrorHandler);

        try
        {
            output = await this.Run(await this.Preprocess(code), errorHandler);
        }
        catch
        { }

        return {
            errors: [...errorHandler.Errors],
            output
        };
    }

    /**
     * Formats the specified {@linkcode code}.
     *
     * @param code
     * The code to format.
     *
     * @returns
     * The formatted code.
     */
    protected async Format(code?: string): Promise<string | undefined>
    {
        if (code)
        {
            let file = this.Project.createSourceFile(
                "/file.ts",
                code,
                {
                    overwrite: true
                });

            file.formatText(
                {
                    ensureNewLineAtEndOfFile: true
                });

            return file.getText().replace(/(\r?\n)+$/, "");
        }
        else
        {
            return undefined;
        }
    }

    /**
     * Runs the transformation of the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected abstract Run(code: string, errorHandler?: IErrorHandler<TNode, TContext>): Promise<string>;

    /**
     * Pre-processes the specified {@linkcode code}.
     *
     * @param code
     * The code to pre-process.
     *
     * @returns
     * Pre-processes the specified {@linkcode code}.
     */
    protected async Preprocess(code: string): Promise<string>
    {
        return code;
    }

    /**
     * Asserts the output of a transformation.
     *
     * @param input
     * The input of the transformation.
     *
     * @param expected
     * The expected output of the transformation.
     */
    protected async Assert(input: string, expected: string): Promise<void>
    {
        let result = await this.Transform(input);

        if (result.errors.length > 0)
        {
            let messages = result.errors.length === 1 ?
                result.errors[0].message :
                JSON.stringify(result.errors.map((error) => error.message));

            throw new Error(
                `Expected \`${input}\` to transform to \`${expected}\`, but got ${result.errors.length === 1 ? "an error" : "errors"}:\n${messages}`);
        }
        else
        {
            await this.CodeEquals(result.output, expected);
        }
    }

    /**
     * Asserts that the specified codes are equal.
     *
     * @param output
     * The output generated by the transformation.
     *
     * @param expected
     * The expected code.
     */
    protected async CodeEquals(output: string | undefined, expected: string | undefined): Promise<void>
    {
        strictEqual(
            await this.Format(output),
            await this.Format(expected));
    }

    /**
     * Asserts the occurrence of an error with the specified {@linkcode message}.
     *
     * @param input
     * The input of the transformation.
     *
     * @param errorClasses
     * The classes of the expected error.
     */
    protected async AssertError(input: string, ...errorClasses: Array<new (...args: any[]) => Error>): Promise<void>
    {
        let result = await this.Transform(input);
        await this.HasError(input, result, ...errorClasses);
    }

    /**
     * Checks whether the specified {@linkcode action} causes one of the specified {@linkcode errorClasses}.
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     *
     * @param errorClasses
     * The expected errors.
     */
    protected async HasError(input: string, result: INameofOutput, ...errorClasses: Array<new (...args: any[]) => Error>): Promise<void>
    {
        let errorNames: string | undefined;

        if (errorClasses.length > 0)
        {
            if (errorClasses.length === 1)
            {
                errorNames = `${errorClasses[0].name}`;
            }
            else
            {
                let classes = errorClasses.map((errorClass) => `\`${errorClass.name}\``);
                let lastClass = classes.pop();
                errorNames = `${classes.join(", ")} or ${lastClass}`;
            }
        }

        if (result.errors.length > 0)
        {
            if (errorClasses.length > 0)
            {
                if (
                    !this.FindError(result, ...errorClasses))
                {
                    throw new Error(
                        `Expected the code ${input} to yield an error with the name ${errorNames}, but got:\n` +
                        JSON.stringify(result.errors.map((error) => `${error.name}: ${error.message}`), null, 4));
                }
            }
        }
        else
        {
            let errorDescriptor = errorNames ? `a ${errorNames}` : "an";

            throw new Error(
                `Expected the code \`${JSON.stringify(input)}\` to cause ${errorDescriptor} error, but returned the following result:\n` +
                `${JSON.stringify(result.output)}`);
        }
    }

    /**
     * Gets the first error from the specified {@linkcode result} which matches the specified {@linkcode errorClasses}.
     *
     * @param result
     * The result to check for errors.
     *
     * @param errorClasses
     * The expected types of errors.
     *
     * @returns
     * The error of one of the specified types.
     */
    protected FindError(result: INameofOutput, ...errorClasses: Array<new (...args: any[]) => Error>): Error | boolean | undefined
    {
        return result.errors.find((error) => errorClasses.some((errorClass) => error.name === errorClass.name));
    }

    /**
     * Gets the default error handler of the transformer under test.
     */
    protected get DefaultErrorHandler(): IErrorHandler<TNode, TContext>
    {
        return new ErrorHandler();
    }
}