import * as fs from 'node:fs'
import * as path from 'node:path'
import { simpleGit } from 'simple-git'
import * as vscode from 'vscode'

const reg = /.(?:com|cn|top|xyz|io|net|org|moe)[/:]([a-zA-Z0-9.]+)\/([a-zA-Z0-9.]+)\s*$/

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem
  private repoUrl = ''
  private projectName = ''

  constructor() {
    const direction = vscode.StatusBarAlignment.Right
    this.statusBarItem = vscode.window.createStatusBarItem(direction)

    this.statusBarItem.hide()
    this.statusBarItem.text = `$(github)`
    this.statusBarItem.command = 'extension.openRepoInBrowser'

    vscode.commands.registerCommand('extension.openRepoInBrowser', () => {
      if (this.repoUrl) {
        const link = vscode.Uri.parse(this.repoUrl)
        vscode.env.openExternal(link)
      }
    })
  }

  public async updateStatusBarItem(): Promise<void> {
    const folders = vscode.workspace.workspaceFolders
    const file = vscode.window.activeTextEditor

    const isWorkspaceOpen = folders && folders.length > 1
    const isFileOpen = file && fs.existsSync(file?.document.uri.fsPath)

    let repoPath = ''

    if (isWorkspaceOpen) {
      repoPath = folders[0].uri.fsPath
    } else if (isFileOpen) {
      repoPath = file?.document.uri.fsPath
    } else {
      return this.statusBarItem.hide()
    }

    const dirPath = path.dirname(repoPath)
    const remote = (await simpleGit(dirPath).listRemote(['--get-url'])).trim()

    if (!remote) {
      return this.statusBarItem.hide()
    }

    if (!remote.startsWith('http')) {
      const info = remote.replace(/((git@)|(\.git\s*$))/g, '').split(/[:/]/)
      const [git, user, repo, sub] = info.map((e) => e.trim())

      this.projectName = `\`${user}/${sub ? `${repo}/${sub}` : repo}\``
      this.repoUrl = `https://${git}/${user}/${repo}`
    } else {
      const [, user, repo] = reg.exec(remote) || []

      this.projectName = `\`${user}/${repo}\``
      this.repoUrl = remote.replace(/\.git\s*$/, '')
    }

    this.statusBarItem.tooltip = `Open ${this.projectName} in Browser`
    this.statusBarItem.show()
  }
}
