export abstract class BaseQuery<T> implements PromiseLike<T> {
    protected resource: string | undefined;
    protected query: Record<string, string | number> = {};
    protected readonly BOOMLINGS_BASE_API = "http://www.boomlings.com/database";

    protected readonly COMMON_SECRET = "Wmfd2893gb7";
    protected readonly ACCOUNT_SECRET = "Wmfv3899gc9";
    protected readonly LEVEL_SECRET = "Wmfv2898gc9";
    protected readonly MOD_SECRET = "Wmfp3879gc3";
    protected readonly ADMIN_SECRET = "Wmfx2878gb9";

    constructor(resource: string) {
        this.resource = resource;
    }

    // Updated signature to match TypeScript's expectations
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        // deno-lint-ignore no-explicit-any
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
        // We wrap the internal logic in a real Promise
        return this.execute().then(onfulfilled, onrejected);
    }

    protected abstract execute(): Promise<T>;
}
