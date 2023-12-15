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
    let name = await vscode.window.showInputBox({
        placeHolder: "Enter a name for your new file (leave blank to autogen)",
    });

    const date = new Date();
    const month = date.toLocaleString("en-POSIX", { month: "short" });
    const m = month[0].toLowerCase();
    const dayOfMonth = date.getDate();
    const pad2 = (n: number | string) => `${n}`.padStart(2, "0");

    const day = pad2(dayOfMonth);
    const prefix = `${m}${day}`;

    if (!name) {
        // Generate it for me Hal
        name = pad2(date.getHours());
    }

    const dirUri = vscode.workspace.workspaceFolders?.at(0)?.uri;
    if (!dirUri) return;

    let fileExtension = "tidal";

    // Start by guessing with the extension of the most recent existing file.
    const ge = await guessedExtension();
    if (ge) fileExtension = ge;

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
        haskell: "hs",
    };

    if (defaultLanguage && typeof defaultLanguage === "string") {
        const possibleExtension = extensionForLanguageID[defaultLanguage];
        if (possibleExtension) {
            fileExtension = possibleExtension;
        }
    }

    let fileName = `${prefix}-${name}.${fileExtension}`;
    let filePath = path.join(dirUri.fsPath, fileName);
    let suffix = 0;
    while (fs.existsSync(filePath) && suffix++ < 5) {
        fileName = `${prefix}-${name}-${suffix}.${fileExtension}`;
        filePath = path.join(dirUri.fsPath, fileName);
    }
    // Give up after a while to avoid infinite loops.
    if (fs.existsSync(filePath)) {
        vscode.window.showErrorMessage(`File ${fileName} already exists`);
        return;
    }
    fs.writeFileSync(filePath, "", "utf8");

    const openPath = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(openPath);
    await vscode.window.showTextDocument(doc);
};

// Find the extension of the most recent file in the current directory.
// Don't search recursively, only in the top-most folder.
const guessedExtension = async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.at(0);
    if (!workspaceFolder) return;
    const directory = workspaceFolder.uri.fsPath;
    const items = await fs.promises.readdir(directory);
    const is = await Promise.all(
        items.map(async (e) => ({
            name: e,
            stat: await fs.promises.stat(path.join(directory, e)),
        }))
    );
    const files = is.filter(({ stat }) => stat.isFile());
    const sorted = files.sort(
        (a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime()
    );

    const latestFile = sorted[0];
    if (!latestFile) return;

    // Trim the leading ".", the upstream function adds it.
    return path.extname(latestFile.name).slice(1);
};
