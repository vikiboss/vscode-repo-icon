import * as fs from 'node:fs'
import * as path from 'node:path'
import * as vscode from 'vscode'

const REG_MATCH_REPO = /url\s*=\s*(https?:\/\/|git@)github\.com[:/]([^/]+)\/([^/]+)((\.git)|\n)/g

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem
  private githubRepoUrl = ''

  constructor() {
    const direction = vscode.StatusBarAlignment.Right
    this.statusBarItem = vscode.window.createStatusBarItem(direction)

    this.statusBarItem.hide()
    this.statusBarItem.text = `$(github)`
    this.statusBarItem.command = 'extension.openInGitHub'

    vscode.commands.registerCommand('extension.openInGitHub', () => {
      if (this.githubRepoUrl) {
        vscode.env.openExternal(vscode.Uri.parse(this.githubRepoUrl))
      }
    })
  }

  public updateStatusBarItem(): void {
    const folders = vscode.workspace.workspaceFolders

    if (!folders || !folders.length) {
      return this.statusBarItem.hide()
    }

    const dirPath = folders[0].uri.fsPath
    const gitFolderPath = path.join(dirPath, '.git')

    if (!fs.existsSync(gitFolderPath)) {
      return this.statusBarItem.hide()
    }

    const configPath = path.join(gitFolderPath, 'config')
    const configFileContent = fs.readFileSync(configPath, 'utf-8')

    const match = REG_MATCH_REPO.exec(configFileContent)

    if (!match) {
      return this.statusBarItem.hide()
    }

    const [owner, repo] = match.slice(2)
    const repository = repo.replace('.git', '')

    this.githubRepoUrl = `https://github.com/${owner}/${repository}`
    this.statusBarItem.tooltip = `Open \`@${owner}/${repository}\` in GitHub`
    this.statusBarItem.show()
  }
}
