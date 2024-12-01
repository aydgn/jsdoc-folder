import * as vscode from "vscode";

type FoldingRangeResult = vscode.ProviderResult<Array<vscode.FoldingRange>>;

const isJSDocStart = (line: string): boolean => line.trim().startsWith("/**");
const isJSDocEnd = (line: string): boolean => line.includes("*/");

const createFoldingRange = (startLine: number, endLine: number): vscode.FoldingRange | null => {
  const lineSpan = endLine - startLine;

  // Ignore single-line JSDoc comments
  if (lineSpan <= 2) return null;

  return new vscode.FoldingRange(startLine + 1, endLine - 1);
};

const getConfig = () => vscode.workspace.getConfiguration("jsdocFolder");

const provideFoldingRanges = (
  document: vscode.TextDocument,
  _context: vscode.FoldingContext,
  token: vscode.CancellationToken
): FoldingRangeResult => {
  if (!document) return [];

  const ranges: Array<vscode.FoldingRange> = [];

  for (let i = 0; i < document.lineCount; i++) {
    if (token.isCancellationRequested) return [];

    const line = document.lineAt(i).text;

    if (isJSDocStart(line)) {
      const startLine = i;

      while (i < document.lineCount) {
        const currentLine = document.lineAt(i).text;
        if (isJSDocEnd(currentLine)) {
          const range = createFoldingRange(startLine, i);
          if (range) ranges.push(range);
          break;
        }
        i++;
      }
    }
  }

  return ranges;
};

const foldJSDoc = async (
  editor: vscode.TextEditor,
  supportedLanguages: readonly string[],
  provider: vscode.FoldingRangeProvider
): Promise<void> => {
  const document = editor.document;

  // Skip if language is not supported or auto-fold is disabled
  if (!supportedLanguages.includes(document.languageId) || !getConfig().get("autoFold")) return;

  const token = new vscode.CancellationTokenSource().token;
  const ranges = await provider.provideFoldingRanges(document, {}, token);

  if (ranges && ranges.length > 0) {
    await vscode.commands.executeCommand("editor.fold", {
      levels: 1,
      direction: "up",
      selectionLines: ranges.map(range => range.start),
    });
  }
};

export function activate(context: vscode.ExtensionContext): void {
  const supportedLanguages = ["javascript", "typescript"];
  const provider = { provideFoldingRanges };

  // Register providers and handlers
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      supportedLanguages.map(language => ({ language })),
      provider
    ),

    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) foldJSDoc(editor, supportedLanguages, provider);
    }),

    vscode.commands.registerCommand("jsdocFolder.enableAutoFold", () => {
      getConfig().update("autoFold", true, true);
      vscode.window.showInformationMessage("JSDoc auto-folding enabled");
    }),

    vscode.commands.registerCommand("jsdocFolder.disableAutoFold", () => {
      getConfig().update("autoFold", false, true);
      vscode.window.showInformationMessage("JSDoc auto-folding disabled");
    })
  );

  // Initial fold for active editor
  if (vscode.window.activeTextEditor) {
    foldJSDoc(vscode.window.activeTextEditor, supportedLanguages, provider);
  }
}

export function deactivate(): void {}
