# Manim Notebook

VSCode extension for replicating Grant Sanderson's `manim` workflow for Sublime Text from [this video](https://www.youtube.com/watch?v=rbu7Zu5X1zI)

**Note** this extension is specifically for [3b1b's original manim library](https://github.com/3b1b/manim), NOT the community version.

## Example usage

1. [Install manimgl](https://3b1b.github.io/manim/getting_started/installation.html), make sure that the command `manimgl` works in your terminal
2. Open your manim file (e.g. `scene.py`) in VSCode
3. Place your cursor where you want to start the scene, on a line of code within the `construct` method in a scene class
4. Run the VSCode command: `cmd+shift+p` -> `Manim Notebook: Start scene at cursor`  
    (This command runs `manimgl scene.py NAME_OF_SCENE -se <lineNumber>` in your terminal)  
    In the upper-right of your screen - the manim interactive video will appear.

<br />

Then you can do either:

- Write some comments which start with: `##`.  
    The clickable "Preview Manim Cell" buttons will appear above each such comment.  
    Clicking on one will run it.  
    It is equivalent to: `cmd+shift+p` -> `Manim Notebook: Preview active Manim Cell`

<br />

- Place your cursor on some line (or highlight several lines),  
    `cmd+shift+p` -> `Manim Notebook: Preview selected Manim code`  
    This will run the selected lines.


<br /><br />

You can use the default keyboard shortcuts for these commands, or assign your own.  

- the default shortcuts all start with `cmd+'`
- use `cmd` or `ctrl` depending on your OS

All current commands are:

- `Manim Notebook: Start scene at cursor`.  
    Shortcut: `cmd+' cmd+s`
- `Manim Notebook: Preview active Manim Cell`.  
    Shortcut: `cmd+' cmd+e`
- `Manim Notebook: Preview selected Manim code`.  
    Shortcut: `cmd+' cmd+r`
- `Manim Notebook: Remove all objects from scene`.  
    Shortcut: `cmd+' cmd+c`
- `Manim Notebook: Quit preview`.  
    Shortcut: `cmd+' cmd+w`



<br /><br />

The resulting workflow can look like Grant's 🥳

[(see demo on youtube)](https://www.youtube.com/watch?v=VaNHlFh0r5E)

<iframe width="560" height="315" src="https://www.youtube.com/embed/VaNHlFh0r5E?si=ClVdBSI1k_-mzKFr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



<br /><br />

## Local Development

Prerequisite: install `vsce` (`npm i -g vsce`)

**Install locally**

After making changes:

1. Bump the version in `package.json`
2. `vsce package` (select `y`; a `.vsix` file will be created) 
3. `cmd+shift+p` -> "Extensions: Install from VSIX" > select the `.vsix` file
4. reload window

<br />

---

[Alternative](https://code.visualstudio.com/api/get-started/your-first-extension):

- open `src/extension.ts`
- to run the extension in a new window: `F5`  
    (or: `cmd+shift+d` -> `Run Extension`)  
    (or: `cmd+shift+p` -> `Debug: Start Debugging`)
- after extension code changes: in that opened window: `cmd+shift+p` -> `Reload Window`

<br />

---

To publish, bump the version in `package.json` and 

`vsce publish`