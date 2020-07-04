export const signals: any[] = [ 
    'SIGABRT',
    'SIGALRM',
    'SIGHUP',
    'SIGINT',
    'SIGTERM',
    'uncaughtException'
]

if (process.platform !== 'win32') {
    signals.push(
      'SIGVTALRM',
      'SIGXCPU',
      'SIGXFSZ',
      'SIGUSR2',
      'SIGTRAP',
      'SIGSYS',
      'SIGQUIT',
      'SIGIOT'
    )
}
  
if (process.platform === 'linux') {
    signals.push(
      'SIGIO',
      'SIGPOLL',
      'SIGPWR',
      'SIGSTKFLT',
      'SIGUNUSED'
    )
}

export default signals