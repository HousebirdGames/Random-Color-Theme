const vscode = require('vscode');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const colorKeys = require('./colorKeys.json');

function generateRandomColor() {
    const randomHex = () => Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
    return `#${randomHex()}${randomHex()}${randomHex()}`;
}

function generateRandomColors() {
    const colors = {};
    colorKeys.forEach(key => {
        colors[key] = generateRandomColor();
    });
    return colors;
}

async function generateTheme(themeName) {
    const themeDir = path.join(__dirname, 'themes');
    if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir);
    }
    const themePath = path.join(themeDir, `${themeName}.json`);
    const themeContent = JSON.stringify({
        name: "Random Color Theme",
        "$schema": "vscode://schemas/color-theme",
        "type": "vs",
        colors: generateRandomColors(),
        "tokenColors": []
    }, null, 2);

    try {
        await fsPromises.writeFile(themePath, themeContent);
        return true;
    } catch (error) {
        console.error(`Failed to create the theme file: ${error}`);
        vscode.window.showErrorMessage(`Failed to create the theme file: ${error}`);
        return false;
    }
}

async function saveCurrentTheme() {
    const themeDir = path.join(__dirname, 'your-random-themes');
    if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir);
    }

    const dateTime = new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-');
    const themeName = `Your Random Color Theme from ${dateTime}`;
    const themePath = path.join(themeDir, `${themeName}.json`);

    const themeContent = JSON.stringify({
        name: themeName,
        "$schema": "vscode://schemas/color-theme",
        "type": "dark",
        colors: generateRandomColors(),
        "tokenColors": []
    }, null, 2);

    try {
        await fsPromises.mkdir(themeDir, { recursive: true });
        await fsPromises.writeFile(themePath, themeContent);
        vscode.window.showInformationMessage(`Theme "${themeName}" saved successfully.`,
            "Open File", "Open Folder").then(selection => {
                if (selection === "Open File") {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(themePath));
                } else if (selection === "Open Folder") {
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(themeDir));
                }
            });
    } catch (error) {
        console.error(`Failed to save the current theme: ${error}`);
        vscode.window.showErrorMessage(`Failed to save the current theme: ${error}`);
    }
}

async function activate(context) {
    let currentTheme = 'Random Color Theme 1';
    const themeCreated = await generateTheme(currentTheme);
    setTimeout(() => {
        if (themeCreated) {
            setTimeout(() => {
                vscode.workspace.getConfiguration().update('workbench.colorTheme', currentTheme, true);
            }, 1000);
        }
    }, 240000);

    setInterval(async () => {
        currentTheme = (currentTheme === 'Random Color Theme 1') ? 'Random Color Theme 2' : 'Random Color Theme 1';
        const themeCreated = await generateTheme(currentTheme);
        if (themeCreated) {
            setTimeout(() => {
                vscode.workspace.getConfiguration().update('workbench.colorTheme', currentTheme, true);
            }, 1000);
        }
    }, 240000);

    let disposableSaveTheme = vscode.commands.registerCommand('randomColorTheme.saveCurrentTheme', saveCurrentTheme);
    context.subscriptions.push(disposableSaveTheme);

    let disposableOpenSavedThemesFolder = vscode.commands.registerCommand('randomColorTheme.openSavedThemesFolder', () => {
        const themeDir = path.join(__dirname, 'your-random-themes');
        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(themeDir));
    });
    context.subscriptions.push(disposableOpenSavedThemesFolder);

    let statusBarThemeSaver = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarThemeSaver.text = `$(save) Save Current Theme`;
    statusBarThemeSaver.tooltip = "Save the currently applied random color theme";
    statusBarThemeSaver.command = 'randomColorTheme.saveCurrentTheme';
    context.subscriptions.push(statusBarThemeSaver);
    statusBarThemeSaver.show();

    context.subscriptions.push(vscode.commands.registerCommand('randomColorTheme.openSavedThemesFolder', () => {
        const themeDir = path.join(__dirname, 'your-random-themes');
        if (fs.existsSync(themeDir)) {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(themeDir));
        } else {
            vscode.window.showInformationMessage("No saved themes folder found.");
        }
    }));
}

function deactivate() { }

module.exports = { activate, deactivate };