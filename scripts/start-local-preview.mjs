import { existsSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { spawn, execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const address = 'http://127.0.0.1:3000/';
const welcomeAddress = address + '#cover';
const sourceFile = path.join(root, 'client/src/components/BottomModules.tsx').replaceAll('\\', '/');
const vite = path.join(root, 'node_modules/vite/bin/vite.js');

async function inspectServer() {
  try {
    const response = await fetch(address + 'src/components/BottomModules.tsx', {
      signal: AbortSignal.timeout(2000), cache: 'no-store',
    });
    const text = await response.text();
    return response.ok && text.includes(sourceFile) ? 'this-project' : 'other-project';
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return 'stopped';
    throw new Error('无法确认本地服务状态，请稍后重试。');
  }
}

async function main() {
  let status = await inspectServer();
  if (status === 'other-project') throw new Error('3000 端口被其他页面占用。请先关闭那个服务，再运行本入口。');
  if (status === 'stopped') {
    if (!existsSync(vite)) throw new Error('缺少项目依赖，请先在项目目录运行 npm install。');
    const logs = path.join(tmpdir(), 'huxiang-preview-' + createHash('sha256').update(root).digest('hex').slice(0, 12));
    mkdirSync(logs, { recursive: true });
    const logFile = path.join(logs, 'vite.log');
    const log = openSync(logFile, 'a');
    let launchError;
    const child = spawn(process.execPath, [vite, '--host', '127.0.0.1', '--port', '3000', '--strictPort'], {
      cwd: root, detached: true, windowsHide: true, stdio: ['ignore', log, log],
    });
    child.on('error', error => { launchError = error; });
    child.unref();
    closeSync(log);
    for (let attempt = 0; attempt < 40; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (launchError) throw launchError;
      status = await inspectServer();
      if (status === 'this-project') break;
      if (status === 'other-project') throw new Error('本地端口被另一服务占用，未打开错误的项目。');
    }
    if (status !== 'this-project') throw new Error('本地启动未完成，请查看日志：' + logFile);
  }
  console.log('本地欢迎页已就绪：' + welcomeAddress);
  console.log('项目目录：' + root);
  if (!process.argv.includes('--no-open')) {
    execFile('cmd.exe', ['/d', '/s', '/c', 'start "" "' + welcomeAddress + '"'], { windowsHide: true }, error => {
      if (error) console.error('请在浏览器打开：' + welcomeAddress);
    });
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
