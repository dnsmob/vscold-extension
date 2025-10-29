import * as vscode from 'vscode';

export function getDelayForSeverity(): number {
    let severity = vscode.workspace.getConfiguration('vscold').get<string>('severity', 'sniffles');
    
    let min: number;
    let max: number;
    
    switch (severity) {
        case 'sniffles':
            // 5-10 minutes (300000-600000 milliseconds)
            min = 300000;
            max = 600000;
            break;
        case 'plague':
            // 2-5 minutes (120000-300000 milliseconds)
            min = 120000;
            max = 300000;
            break;
        case 'annoying':
            // 5-10 seconds (5000-10000 milliseconds) - development only
            min = 5000;
            max = 10000;
            break;
        case 'flu':
        default:
            // 3-7 minutes (180000-420000 milliseconds)
            min = 180000;
            max = 420000;
            break;
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
