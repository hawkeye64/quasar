const pm = process.env.npm_config_user_agent
export const runningPackageManager = pm?.split(' ')[0].split('/')[0]
