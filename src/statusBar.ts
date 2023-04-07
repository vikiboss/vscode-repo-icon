import * as fs from 'node:fs'
import * as path from 'node:path'
import * as vscode from 'vscode'

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem
  private githubRepoUrl = ''

  constructor() {
    const direction = vscode.StatusBarAlignment.Right
    this.statusBarItem = vscode.window.createStatusBarItem(direction)

    this.statusBarItem.text = `$(github)`
    this.statusBarItem.command = 'extension.openInGitHub'
    this.statusBarItem.hide()

    vscode.commands.registerCommand('extension.openInGitHub', () => {
      if (this.githubRepoUrl) {
        vscode.env.openExternal(vscode.Uri.parse(this.githubRepoUrl))
      }
    })
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

    const githubUrlRegExp =
      /url\s*=\s*(https?:\/\/|git@)github\.com[:/]([^/]+)\/([^/]+)((\.git)|\n)/g
    const match = githubUrlRegExp.exec(configFileContent)

    if (!match) {
      this.statusBarItem.hide()
      return
    }

    const [owner, repo] = match.slice(2)
    const repository = repo.replace('.git', '')

    this.githubRepoUrl = `https://github.com/${owner}/${repository}`
    this.statusBarItem.tooltip = `Open \`@${owner}/${repository}\` in GitHub`
    this.statusBarItem.show()
  }
}
