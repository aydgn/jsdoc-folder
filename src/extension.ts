import * as vscode from 'vscode';

/**
 * Provider that handles the folding behavior for JSDoc comment blocks
 * Implements VS Code's FoldingRangeProvider interface
 */
class JSDocFoldingRangeProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        _context: vscode.FoldingContext, // Added underscore to indicate intentionally unused parameter
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {
        const ranges: vscode.FoldingRange[] = [];

        // Iterate through each line in the document
        for (let i = 0; i < document.lineCount; i++) {
            // Check for cancellation request to keep the editor responsive
            if (token.isCancellationRequested) {
                return [];
            }

            const line = document.lineAt(i);

            // Detect the start of a JSDoc block
            if (line.text.trim().startsWith('/**')) {
                const startLine = i;

                // Find the end of the JSDoc block
                while (i < document.lineCount) {
                    const currentLine = document.lineAt(i);
                    if (currentLine.text.includes('*/')) {
                        // Create folding range that excludes the /** and */ lines
                        if (i - startLine > 1) {
                            ranges.push(new vscode.FoldingRange(startLine + 1, i - 1));
                        }
                        break;
                    }
                    i++;
                }
            }
        }

        return ranges;
    }
}

/**
 * Called when the extension is activated
 * Sets up the folding provider and document event handlers
 */
export function activate(context: vscode.ExtensionContext) {
    const provider = new JSDocFoldingRangeProvider();
    const supportedLanguages = ['javascript', 'typescript'];

    // Register our folding provider for JS/TS files
    const disposable = vscode.languages.registerFoldingRangeProvider(
        supportedLanguages.map(language => ({ language })),
        provider
    );

    context.subscriptions.push(disposable);

    /**
     * Helper function to fold JSDoc comments in a text editor
     * Only folds if the file type is supported and auto-fold is enabled
     */
    const foldJSDoc = async (editor: vscode.TextEditor) => {
        const document = editor.document;
        if (!supportedLanguages.includes(document.languageId)) {
            return;
        }

        // Check user settings for auto-fold preference
        const config = vscode.workspace.getConfiguration('jsdocFolder');
        if (!config.get('autoFold')) {
            return;
        }

        // Get folding ranges and apply folding
        const ranges = await provider.provideFoldingRanges(document, {}, new vscode.CancellationTokenSource().token);
        if (ranges && ranges.length > 0) {
            // Execute VS Code's fold command with our custom ranges
            await vscode.commands.executeCommand('editor.fold', {
                levels: 1,
                direction: 'up',
                selectionLines: ranges.map(range => range.start)
            });
        }
    };

    // Apply folding to the active editor when extension is first activated
    if (vscode.window.activeTextEditor) {
        foldJSDoc(vscode.window.activeTextEditor);
    }

    // Watch for new editors being opened and fold their JSDoc comments
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                foldJSDoc(editor);
            }
        })
    );

    // Register commands for enabling/disabling auto-fold
    context.subscriptions.push(
        vscode.commands.registerCommand('jsdocFolder.enableAutoFold', () => {
            vscode.workspace.getConfiguration('jsdocFolder').update('autoFold', true, true);
            vscode.window.showInformationMessage('JSDoc auto-folding enabled');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('jsdocFolder.disableAutoFold', () => {
            vscode.workspace.getConfiguration('jsdocFolder').update('autoFold', false, true);
            vscode.window.showInformationMessage('JSDoc auto-folding disabled');
        })
    );
}

// Called when the extension is deactivated
export function deactivate() {}
