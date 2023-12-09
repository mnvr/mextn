An (unpublished) lil VSCode extension to create a new file in the current
workspace with a name generated from a template.

I have bound it to a keybinding

    {
        "key": "cmd+m cmd+n",
        "command": "mextn.new"
    },

so I can just use ⌘ M ⌘ N to create a new file quickly. The list of file types
it supports can be manually modified in `src/extension.ts`.

## Installing

Install dependencies using

    yarn

Then, you can run then this extension directly from source by doing

    yarn dev

This creates a temporary .vsix binary file and installs it to your local VS Code
instance. After making changes in the code, you can re-run `yarn dev` to update
the installation; in this case, remember to use the VS Code "Developer: Reload
Window" command after running `yarn dev` (this seems to be needed to get the
running VS Code window to pick up changes).
