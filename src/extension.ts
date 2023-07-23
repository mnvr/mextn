// The module "vscode" contains the VS Code extensibility API
//
// Import the module and reference it with the alias vscode.
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

        vscode.window.showInformationMessage("Hello!");
    });

    context.subscriptions.push(disposable);
};
