import postgres from "postgres";

// --- CONFIGURATION ---
// Replace with your actual database connection details.
// For better security, consider using environment variables.
const DB_CONFIG = {
  hostname: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin12345",
  database: "loggd",
  // Use 'require' for local development if you don't have SSL configured.
  // In production, prefer 'verify-full' with a CA certificate.
  // ssl: "require" as const,
};

const OUTPUT_FILE = "./src/lib/db-types.ts";
const SCHEMA_NAME = "public"; // The database schema to inspect.

// --- TYPE MAPPING ---
/**
 * Maps PostgreSQL data types to TypeScript types.
 * @param udtName The PostgreSQL UDT (User-Defined Type) name from information_schema.
 * @returns The corresponding TypeScript type as a string.
 */
function pgTypeToTsType(
  udtName: string,
  enums: Record<string, string[]>,
): string {
  const isArray = udtName.startsWith("_");
  const baseType = isArray ? udtName.substring(1) : udtName;

  let tsBaseType: string;

  // Determine the base TypeScript type (without the array suffix)
  if (enums[baseType]) {
    // It's a known custom enum type
    tsBaseType = enums[baseType].map((v) => `'${v}'`).join(" | ");
  } else {
    // It's a standard type
    switch (baseType.toLowerCase()) {
      case "int2":
      case "int4":
      case "int8":
      case "float4":
      case "float8":
      case "numeric":
      case "money":
      case "oid":
        tsBaseType = "number";
        break;

      case "varchar":
      case "text":
      case "char":
      case "bpchar": // Blank-padded char
      case "uuid":
      case "inet":
      case "citext": // A common case-insensitive text extension
        tsBaseType = "string";
        break;

      case "bool":
        tsBaseType = "boolean";
        break;

      case "date":
      case "timestamp":
      case "timestamptz":
        tsBaseType = "Date"; // Using string is often safer for serialization (e.g., JSON). Can also be 'Date'.
        break;

      case "json":
      case "jsonb":
        tsBaseType = "any"; // Or a more specific type like 'Record<string, any>' or a 'Json' type.
        break;

      case "bytea":
        tsBaseType = "Uint8Array";
        break;

      default:
        console.warn(
          `[Warning] Unknown PostgreSQL type: ${baseType}. Falling back to 'any'.`,
        );
        tsBaseType = "any";
    }
  }
  if (isArray) {
    // For union types (our enums), parentheses are required for correct precedence.
    if (enums[baseType]) {
      return `(${tsBaseType})[]`;
    }
    // For single types ('string', 'number', etc.), parentheses are not needed.
    return `${tsBaseType}[]`;
  }

  return tsBaseType;
}

// --- UTILITY FUNCTIONS ---
/**
 * Converts a snake_case or kebab-case string to PascalCase.
 * @example toPascalCase('user_profile') -> 'UserProfile'
 */
function toPascalCase(str: string): string {
  return str
    .split(/_|-/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * A simple singularization function. Works for basic plurals ending in 's'.
 * @example singularize('users') -> 'user'
 */
function singularize(str: string): string {
  if (str.toLowerCase().endsWith("ies")) {
    return str.slice(0, -3) + "y";
  }
  if (str.toLowerCase().endsWith("s") && !str.toLowerCase().endsWith("ss")) {
    return str.slice(0, -1);
  }
  return str;
}

// --- MAIN LOGIC ---
async function main() {
  console.log(`Connecting to database "${DB_CONFIG.database}"...`);
  const sql = postgres(DB_CONFIG);

  try {
    // 1. Fetch all custom ENUM types and their values
    console.log("Fetching custom enum types...");
    const enumQuery = await sql`
      SELECT
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = ${SCHEMA_NAME}
      ORDER BY t.typname, e.enumsortorder;
    `;

    const enums: Record<string, string[]> = {};
    for (const row of enumQuery) {
      if (!enums[row.enum_name]) {
        enums[row.enum_name] = [];
      }
      enums[row.enum_name].push(row.enum_value);
    }
    console.log(`Found ${Object.keys(enums).length} custom enum types.`);

    // 2. Fetch all table columns
    console.log("Fetching table schemas...");
    const columns = await sql`
      SELECT
        table_name,
        column_name,
        udt_name,
        is_nullable
      FROM
        information_schema.columns
      WHERE
        table_schema = ${SCHEMA_NAME}
      ORDER BY
        table_name,
        ordinal_position;
    `;

    if (columns.length === 0) {
      console.log(`No tables found in schema "${SCHEMA_NAME}". Exiting.`);
      return;
    }
    console.log(
      `Found ${columns.length} columns in ${new Set(columns.map((c) => c.table_name)).size} tables.`,
    );

    // 3. Generate the TypeScript definitions
    let typeDefs = `/**
 * This file was auto-generated by a Deno script.
 * Please do not edit this file directly.
 *
 * Generated at: ${new Date().toISOString()}
 */\n\n`;

    // Group columns by table name for interface generation
    const tables: Record<string, any[]> = {};
    for (const col of columns) {
      if (!tables[col.table_name]) {
        tables[col.table_name] = [];
      }
      tables[col.table_name].push(col);
    }

    // Generate INTERFACE types
    for (const tableName in tables) {
      const interfaceName = toPascalCase(singularize(tableName));
      typeDefs += `export interface ${interfaceName} {\n`;

      const tableColumns = tables[tableName];
      for (const col of tableColumns) {
        const tsType = pgTypeToTsType(col.udt_name, enums);
        const isNullable = col.is_nullable === "YES";

        typeDefs += `  /** @db_type ${col.udt_name} */\n`;
        typeDefs += `  ${col.column_name}${isNullable ? "?" : ""}: ${tsType}${isNullable ? " | null" : ""};\n`;
      }
      typeDefs += "}\n\n";
    }

    // 4. Write the generated types to the output file
    await Deno.writeTextFile(OUTPUT_FILE, typeDefs);
    console.log(`✅ Successfully generated types and saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("An error occurred during type generation:");
    console.error(error);
  } finally {
    await sql.end();
    console.log("Database connection closed.");
  }
}

// Run the main function
main();
