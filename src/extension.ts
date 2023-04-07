import * as vscode from 'vscode'

import { StatusBar } from './statusBar'

export function activate() {
  const statusBar = new StatusBar()
  const handler = () => statusBar.updateStatusBarItem()

  vscode.window.onDidChangeActiveTextEditor(handler)
  vscode.workspace.onDidChangeWorkspaceFolders(handler)
  vscode.workspace.onDidChangeConfiguration(handler)

  handler()
}

export function deactivate() {}
