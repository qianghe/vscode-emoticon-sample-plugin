/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */

import * as vscode from 'vscode';
import { searchMatchedTextLocs } from './util';

/** Code that is used to associate diagnostic entries with code actions. */
export const EMOTION_REPLACE = 'emotion-replace';


/**
 * Analyzes the text document for problems. 
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param emojiDiagnostics diagnostic collection
 */
export function refreshDiagnostics(doc: vscode.TextDocument, emojiDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
		const matchedEmoticons = searchMatchedTextLocs(lineOfText.text);

		matchedEmoticons.forEach(({ word, loc }) => {
			diagnostics.push(createDiagnostic(lineIndex, word, loc));
		});
	}

	emojiDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(lineIndex: number, word: string, wordStartLoc: number): vscode.Diagnostic {
	// create range that represents, where in the document the word is
	const range = new vscode.Range(lineIndex, wordStartLoc, lineIndex, wordStartLoc + word.length);

	const diagnostic = new vscode.Diagnostic(
		range, 
		"You can replace the word with a emoticon~",
		vscode.DiagnosticSeverity.Information
	);
	diagnostic.code = EMOTION_REPLACE;

	return diagnostic;
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, emojiDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, emojiDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, emojiDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, emojiDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => emojiDiagnostics.delete(doc.uri))
	);

}