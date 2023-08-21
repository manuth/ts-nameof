import { join } from "path";
import babel = require("@babel/core");
import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/tests-common";
import babelPluginMacros from "babel-plugin-macros";

/**
 * Provides the functionality to test the babel macro.
 */
export class BabelMacroTester extends TransformerTester<undefined>
{
    /**
     * The name of the component to import.
     */
    private componentName: string | undefined;

    /**
     * @inheritdoc
     */
    public RegisterCommon(): void
    {
        teardown(
            () =>
            {
                this.componentName = undefined;
            });

        suite(
            "using a name other than nameof",
            () =>
            {
                setup(
                    () =>
                    {
                        this.componentName = "other";
                    });

                test(
                    "should work when using a different import name",
                    async () =>
                    {
                        await this.Assert("other(console.log);other.full(console.log);", '"log";"console.log";');
                    });
            });

        super.RegisterCommon();
    }

    /**
     * @inheritdoc
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
    protected async Run(code: string, errorHandler?: IErrorHandler<undefined> | undefined): Promise<string>
    {
        let result: string | undefined | null;

        try
        {
            result = (
                await babel.transformAsync(
                    code,
                    {
                        presets: [
                            "@babel/preset-typescript"
                        ],
                        plugins: [
                            [
                                babelPluginMacros,
                                {
                                    nameof: {
                                        errorHandler
                                    }
                                }
                            ]
                        ],
                        filename: join(__dirname, "test.ts"),
                        ast: false,
                        generatorOpts: {
                            retainLines: true
                        }
                    }))?.code;
        }
        catch (exception)
        { }

        return result ?? "";
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to pre-process.
     *
     * @returns
     * The pre-processed code.
     */
    protected async Preprocess(code: string): Promise<string>
    {
        return `import ${this.componentName ?? "nameof"} from './ts-nameof.macro';${code}`;
    }
}
