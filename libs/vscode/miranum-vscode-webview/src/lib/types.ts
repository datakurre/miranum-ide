export interface VscMessage<T> {
    type: string;
    data?: T;
    message?: string;
}

export class NoEditorError extends Error {
    constructor() {
        super("No editor was initialized.");
    }
}
