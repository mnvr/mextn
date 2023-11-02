// The module "vscode" contains the VS Code extensibility API
//
// Import the module and reference it with the alias vscode.
import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

// This method is called when our extension is activated.
//
// The extension is activated the first time a command is executed.
export const activate = (context: vscode.ExtensionContext) => {
    console.log("mextn: We got activated");

    // The command has been defined in `package.json`, here we provide the
    // implementation. The `commandId` must match the `command` field in
    // `package.json`.
    const disposable = vscode.commands.registerCommand("mextn.new", () => {
        // This code will run when the command is executed.

        // vscode.window.showInformationMessage("Hello!");
        createNewFile();
    });

    context.subscriptions.push(disposable);
};

const createNewFile = async () => {
    const name = await vscode.window.showInputBox({
        placeHolder: "Enter a name for your new Tidal file",
    });
    if (!name) return;

    const dirUri = vscode.workspace.workspaceFolders?.at(0)?.uri;
    if (!dirUri) return;

    const date = new Date();
    const month = date.toLocaleString("en-POSIX", { month: "short" });
    const m = month[0].toLowerCase();
    const dayOfMonth = date.getDate();
    const day = `${dayOfMonth}`.padStart(2, "0");
    const prefix = `${m}${day}`;

    let fileExtension = "tidal";

    // See if there is a default file type defined in the workspace
    // configuration. If so, try to use that to set the extension.
    const defaultLanguage = await vscode.workspace
        .getConfiguration("files")
        .get("defaultLanguage");
    // I don't yet know how to find the extensions corresponding to a given
    // vscode language identifier, or if it that is currently even possible.
    //
    // There is a way to get the list of all language ids in the language
    // namespace, via `vscode.languages.getLanguages()`, but I didn't find a way
    // to obtain the list of extensions associated with that language ID.
    //
    // So for now, hardcode the mapping to some known types.
    const extensionForLanguageID: Record<string, string> = {
        markdown: "md",
    };
    if (defaultLanguage && typeof defaultLanguage === "string") {
        const possibleExtension = extensionForLanguageID[defaultLanguage];
        if (possibleExtension) {
            fileExtension = possibleExtension;
        }
    }

    const fileName = `${prefix}-${name}.${fileExtension}`;
    const filePath = path.join(dirUri.fsPath, fileName);
    fs.writeFileSync(filePath, "", "utf8");

    const openPath = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(openPath);
    await vscode.window.showTextDocument(doc);
};
