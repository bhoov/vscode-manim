# Contributing

1. Fork the repository and clone this fork
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit your changes: `git commit -m "Add your commit message"`
5. Push to the branch on your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

## Style Guidelines

Right now, the goal is to replicate Grant's sublime workflow in VSCode. Thus, we currently aim to keep things minimal and focused.

- Most new functionality should be added to `src/extensions.ts`
- Use clear and descriptive variable/function names.
- As much as possible, minimize editing global state (e.g., the clipboard). This is already done a lot inside the manim 🙈

## Additional Guidelines

- Before starting work on a new feature, please open an issue to introduce it and allow discussion
- There is currently no documentation. Keep your code clean and describe the functionality in the github issue as much as possible.
