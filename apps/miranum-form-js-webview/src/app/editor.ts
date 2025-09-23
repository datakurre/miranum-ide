import { Playground } from "@bpmn-io/form-js-playground";
import { NoEditorError } from "@miranum-ide/vscode/miranum-vscode-webview";
import Split from "split.js";

let playground: Playground | undefined;

/**
 * Create a new form editor instance.
 */
export function createEditor(schema: string | undefined, onSchemaChangedCb?: () => void): Playground {
    const container = document.querySelector("#app");
    if (!container) {
        throw new Error("Could not find container element #app");
    }
    playground = new Playground({
        container,
        schema: schema ? JSON.parse(schema) : undefined,
        data: {},
    });

    // The splitter logic should run only once after the playground is rendered,
    // which happens when the file is loaded.
    const onRendered = () => {
        const root = container.querySelector<HTMLElement>(".fjs-pgl-root");
        const palette = container.querySelector<HTMLElement>(".fjs-pgl-palette-container");
        const main = container.querySelector<HTMLElement>(".fjs-pgl-main");
        const properties = container.querySelector<HTMLElement>(".fjs-pgl-properties-container");
        const sections = main?.querySelectorAll<HTMLElement>(".fjs-pgl-section");

        const formDefinitionSection = Array.from(sections || []).find((s) =>
            s.textContent?.includes("Form Definition"),
        );
        const formPreviewSection = Array.from(sections || []).find((s) =>
            s.textContent?.includes("Form Preview"),
        );
        const formInputSection = Array.from(sections || []).find((s) =>
            s.textContent?.includes("Form Input"),
        );
        const formOutputSection = Array.from(sections || []).find((s) =>
            s.textContent?.includes("Form Output"),
        );

        if (
            root &&
            palette &&
            main &&
            properties &&
            formDefinitionSection &&
            formPreviewSection &&
            formInputSection &&
            formOutputSection
        ) {
            main.remove();

            const definitionColumn = document.createElement("div");
            definitionColumn.classList.add("column");
            definitionColumn.appendChild(formDefinitionSection);
            definitionColumn.appendChild(formInputSection);

            const previewColumn = document.createElement("div");
            previewColumn.classList.add("column");
            previewColumn.appendChild(formPreviewSection);
            previewColumn.appendChild(formOutputSection);

            const resizableContainer = document.createElement("div");
            resizableContainer.classList.add("resizable-container");
            resizableContainer.appendChild(definitionColumn);
            resizableContainer.appendChild(previewColumn);
            resizableContainer.appendChild(properties);

            root.insertBefore(resizableContainer, palette.nextSibling);

            Split([definitionColumn, previewColumn, properties], {
                sizes: [40, 40, 20],
                minSize: [200, 200, 200],
                gutterSize: 8,
                cursor: "col-resize",
            });

            Split([formDefinitionSection, formInputSection], {
                direction: "vertical",
                sizes: [50, 50],
                minSize: 100,
                gutterSize: 8,
                cursor: "row-resize",
            });

            Split([formPreviewSection, formOutputSection], {
                direction: "vertical",
                sizes: [50, 50],
                minSize: 100,
                gutterSize: 8,
                cursor: "row-resize",
            });
        }

        // Subscribe to schema changes only after playground is initialized
        if (onSchemaChangedCb) {
            getEditor().getForm().on("import.done", onSchemaChangedCb);
        }

        // remove the listener after the first execution
        playground?.off("formPlayground.rendered", onRendered);
    };

    playground.on("formPlayground.rendered", onRendered);

    return playground;
}

/**
 * Load the schema into the editor.
 * @param schema
 * @returns
 * @throws NoEditorError if the editor is not initialized
 */
export async function loadSchema(schema: string): Promise<any> {
    return getEditor().getEditor().importSchema(JSON.parse(schema));
}

/**
 * Get the schema from the editor.
 * @return the schema content
 * @throws NoEditorError if the editor is not initialized
 */
export function exportSchema(): object {
    return getEditor().getSchema();
}

/**
 * Get the editor instance.
 * @throws NoEditorError if the editor is not initialized
 */
function getEditor(): Playground {
    if (!playground) {
        throw new NoEditorError();
    }

    return playground;
}
