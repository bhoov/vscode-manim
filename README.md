# vscode-manim 

Very simple VSCode extension for replicating Grant Sanderson's `manim` workflow for Sublime Text from [this video](https://www.youtube.com/watch?v=rbu7Zu5X1zI)

**Note** this extension is specifically for [3b1b's original manim library](https://github.com/3b1b/manim), NOT the community version.

## Example usage

After installing:

1. Open your manim `scene.py` in VSCode (replace `scene.py` with your manim file)
2. In the attached terminal, run `manimgl scene.py NAME_OF_SCENE -se 155` (replace 155 with line number to start debugging). In the upper-right of your screen the manim interactive video should pop up
3. Highlight the "section" you want to run (In manim, a section is a comment (`id`) followed by a block of code )
4. Type `cmd+shift+p` "Checkpoint paste from vscode-manim" ( or default binding `cmd+' cmd+r` ). This will copy the selected code to the clipboard and send the `checkpoint_paste()` command from manim into the interactive window.

The resulting workflow looks like Grant's 🥳

[(see demo on youtube)](https://www.youtube.com/watch?v=VaNHlFh0r5E)

<iframe width="560" height="315" src="https://www.youtube.com/embed/VaNHlFh0r5E?si=ClVdBSI1k_-mzKFr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


**Recommended keyboard bindings**:
- `checkpoint_paste` :: `cmd+' cmd+r` 

## Todo
- [X] Support `checkpoint_paste()` for interactive development
- [ ] Port Grant's other sublime plugins from [this repo](https://github.com/3b1b/videos/tree/bfa09d02afa9b802004525a86592162021afede9/sublime_custom_commands) (i.e., manim_exit, manim_recorded_checkpoint_paste, manim_run_scene, manim_skipped_checkpoint_paste, open_mirrored_directory), as useful

## Local Development

(mostly for my own future reference)

Make changes to `src/extension.ts` then

```
npm run compile
vsce package # `npm i -g vsce` if not already installed
```

Install locally:
cmd+shift+p > "Extensions: Install from VSIX"

<br />

---

Alternative:

- set version in `package.json`
- `cd` to the extension root dir -> `vsce package` (select `y`) -> a `.vsix` file will be created
- `cmd+shift+p` -> "Extensions: Install from VSIX" -> select this file -> reload window and terminal

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