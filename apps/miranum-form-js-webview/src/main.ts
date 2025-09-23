import "./styles/default.css";

import {
    asyncDebounce,
    Command,
    createResolver,
    formatErrors,
    GetFormSchemaCommand,
    LogErrorCommand,
    LogInfoCommand,
    NoEditorError,
    Query,
    SyncDocumentCommand,
    FileQuery,
} from "@miranum-ide/vscode/miranum-vscode-webview";
import {
    createEditor,
    exportSchema,
    getVsCodeApi,
    loadSchema,
} from "./app";

const vscode = getVsCodeApi();

/**
 * Debounce the update of the schema content to avoid too many updates.
 * @param schema
 * @throws NoEditorError if the editor is not available
 */
const debouncedUpdateSchema = asyncDebounce(openSchema, 100);

// create resolver to wait for the response from the backend
const formSchemaResolver = createResolver<FileQuery>();

let editorIsInitialized = false;

/**
 * The Main function that gets executed after the webview is fully loaded.
 * This way we can ensure that when the backend sends a message, it is caught.
 * There are two reasons why a webview gets build:
 * 1. A new .form file was opened
 * 2. User switched to another tab and now switched back
 */
window.onload = async function () {
    window.addEventListener("message", onReceiveMessage);

    vscode.postMessage(new GetFormSchemaCommand());

    const formSchemaQuery = await formSchemaResolver.wait();
    await initializeEditor(formSchemaQuery?.content);
    editorIsInitialized = true;

    console.debug("[DEBUG] Editor is initialized...");
};

async function initializeEditor(
    schema: string | undefined,
) {
    try {
        createEditor(schema, sendSchemaChanges);
    } catch (error: any) {
        if (error instanceof NoEditorError) {
            vscode.postMessage(new LogErrorCommand(error.message));
        } else {
            vscode.postMessage(
                new LogErrorCommand(`Unable to open schema\n${error.message}`),
            );
        }
    }
}

/**
 * Open or update the editor with the new schema content.
 * @param schema
 * @throws NoEditorError if the editor is not available
 */
async function openSchema(schema?: string) {
    if (schema) {
        try {
            await loadSchema(schema);
        } catch (err: any) {
            const warnings = `with following warnings: ${formatErrors(err.warnings)}`;
            vscode.postMessage(new LogInfoCommand(warnings));
        }
    }
}

/**
 * Send the changed schema content to the backend to update the .form file.
 */
async function sendSchemaChanges() {
    const schema = exportSchema();
    vscode.postMessage(new SyncDocumentCommand(JSON.stringify(schema, null, 4)));
}

/**
 * Listen to messages from the backend.
 */
async function onReceiveMessage(message: MessageEvent<Query | Command>) {
    const queryOrCommand = message.data;
    const errorPreFix = "Error receiving message" + queryOrCommand.type;

    switch (true) {
        case queryOrCommand.type === "FileQuery": {
            try {
                const formSchemaQuery = message.data as FileQuery;
                if (editorIsInitialized) {
                    await debouncedUpdateSchema(formSchemaQuery.content);
                } else {
                    formSchemaResolver.done(formSchemaQuery);
                }
            } catch (error: any) {
                vscode.postMessage(new LogErrorCommand(errorPreFix + error.message));
            }
            break;
        }
    }
}
