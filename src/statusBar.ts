import * as fs from 'node:fs'
import * as path from 'node:path'
import * as vscode from 'vscode'

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem

  constructor() {
    const direction = vscode.StatusBarAlignment.Right
    this.statusBarItem = vscode.window.createStatusBarItem(direction)
  }

  public updateStatusBarItem(): void {
    if (!vscode.workspace.workspaceFolders) {
      this.statusBarItem.hide()
      return
    }

    const dirPath = vscode.workspace.workspaceFolders[0].uri.fsPath
    const gitFolderPath = path.join(dirPath, '.git')

    if (!fs.existsSync(gitFolderPath)) {
      this.statusBarItem.hide()
      return
    }

    const configPath = path.join(gitFolderPath, 'config')
    const configFileContent = fs.readFileSync(configPath, 'utf8')

    const githubUrlRegExp = /url\s*=\s*https:\/\/github\.com\/([^/]+)\/([^/]+)\.git/g
    const match = githubUrlRegExp.exec(configFileContent)

    if (!match) {
      this.statusBarItem.hide()
      return
    }

    const [_, owner, repo] = match
    const githubRepoUrl = `https://github.com/${owner}/${repo}`

    this.statusBarItem.text = `$(github)`
    this.statusBarItem.tooltip = `Open \`@${owner}/${repo}\` in GitHub`
    this.statusBarItem.command = 'extension.openGitHubRepo'
    this.statusBarItem.show()

    vscode.commands.registerCommand('extension.openGitHubRepo', () => {
      vscode.env.openExternal(vscode.Uri.parse(githubRepoUrl))
    })
  }
}
