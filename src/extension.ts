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
    const prefix = `${m}${dayOfMonth}`;

    const fileName = `${prefix}-${name}.tidal`;
    const filePath = path.join(dirUri.fsPath, fileName);
    fs.writeFileSync(filePath, "", "utf8");

    const openPath = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(openPath);
    await vscode.window.showTextDocument(doc);
};
