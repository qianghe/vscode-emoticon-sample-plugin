/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { subscribeToDocumentChanges, EMOTION_REPLACE } from './diagnostics';
import { tagEmoticonMap } from './util';

const COMMAND = 'code-actions-sample.command';

export function activate(context: vscode.ExtensionContext) {
	const emojiDiagnostics = vscode.languages.createDiagnosticCollection("emoji");
	context.subscriptions.push(emojiDiagnostics);

	subscribeToDocumentChanges(context, emojiDiagnostics);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('markdown', new EmoticonInfo(), {
			providedCodeActionKinds: EmoticonInfo.providedCodeActionKinds
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(COMMAND, () => vscode.env.openExternal(vscode.Uri.parse('https://unicode.org/emoji/charts-12.0/full-emoji-list.html')))
	);
}


/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class EmoticonInfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		// for each diagnostic entry that has the matching `code`, create a code action command
		const hitDiagnostic = context.diagnostics
			.filter(diagnostic => diagnostic.code === EMOTION_REPLACE);
		
		if (hitDiagnostic) {
			return this.createCommandCodeActions(document, hitDiagnostic[0]);
		}

		return [];
	}

	private createCommandCodeActions(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction[] {
		const { range } = diagnostic;
		const { start, end } = range;
		// line of the diagnostic
		const line = document.lineAt(start.line);
		const emoticonSymbol = line.text.slice(start.character, end.character);
		const recommendEmoticons: string[] = tagEmoticonMap.get(emoticonSymbol)!;

		return recommendEmoticons.map(emoticon => {
			const fix = new vscode.CodeAction(`pick ${emoticon}`, vscode.CodeActionKind.QuickFix);
			fix.edit = new vscode.WorkspaceEdit();
			fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, emoticonSymbol.length)), emoticon);
			fix.diagnostics = [diagnostic];
			return fix;
		});
	}
}