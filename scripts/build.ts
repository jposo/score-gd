if (Deno.env.get("RUN_MIGRATIONS") === "true") {
    const status = await new Deno.Command(Deno.execPath(), {
        args: ["task", "drizzle:migrate"],
    }).spawn().status;
    if (!status.success) throw new Error("Migration failed");
} else {
    console.log("Skipping migrations (RUN_MIGRATIONS not set)");
}
