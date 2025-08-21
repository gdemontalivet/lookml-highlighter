const vscode = require('vscode');
const { Lams } = require('@looker/look-at-me-sideways');

function activate(context) {
    const collection = vscode.languages.createDiagnosticCollection('lookml');
    context.subscriptions.push(vscode.commands.registerCommand('lookml-highlighter.validateLookML', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            updateDiagnostics(editor.document, collection);
        }
    }));

    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDiagnostics(editor.document, collection);
        }
    }));
}

function updateDiagnostics(document, collection) {
    if (document && document.languageId === 'lookml') {
        const lams = new Lams();
        const {
            errors
        } = lams.parse(document.getText());
        const diagnostics = errors.map(error => {
            const range = new vscode.Range(
                new vscode.Position(error.line - 1, 0),
                new vscode.Position(error.line - 1, 100)
            );
            return new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error);
        });
        collection.set(document.uri, diagnostics);
        if (diagnostics.length === 0) {
            vscode.window.showInformationMessage('LookML validation successful!');
        }
    } else {
        collection.clear();
    }
}

module.exports = {
    activate
};
