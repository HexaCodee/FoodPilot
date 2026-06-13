$root = Split-Path -Parent $MyInvocation.MyCommand.Path
node "$root\scripts\dev.mjs"
