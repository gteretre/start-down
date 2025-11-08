# Import all JSON demo datasets in the demo-data folder into MongoDB using the Docker Mongo service.

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string] $MongoUri = ${env:MONGODB_URI},

    [Parameter(Mandatory = $false)]
    [string] $Database = ${env:MONGODB_DB}
)

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Warning "[WARN] $Message"
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Invoke-DockerCompose {
    param(
        [string[]] $Arguments,
        [switch] $IgnoreErrors
    )

    $composeArgs = @('compose') + $Arguments
    $output = & $script:dockerPath @composeArgs
    $exitCode = $LASTEXITCODE

    if (-not $IgnoreErrors -and $exitCode -ne 0) {
        throw "docker compose $($Arguments -join ' ') failed with exit code $exitCode."
    }

    return ,$output
}

try {
    $repoRoot = Split-Path -Parent $PSScriptRoot
    $demoDir = Join-Path $repoRoot 'demo-data'

    if (-not (Test-Path $demoDir)) {
        throw "Demo data directory not found at '$demoDir'."
    }

    if (-not $MongoUri) {
        throw "Mongo connection string not provided. Set MONGODB_URI env var or use -MongoUri."
    }

    if (-not $Database) {
        throw "Database name not provided. Set MONGODB_DB env var or use -Database."
    }

    $dockerPath = (Get-Command 'docker' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source)
    if (-not $dockerPath) {
        throw 'Docker CLI not found. Install Docker Desktop and ensure "docker" is on the PATH.'
    }

    Write-Info "Using Mongo URI: $MongoUri"
    Write-Info "Target database: $Database"
    Write-Info "Docker CLI: $dockerPath"

    Push-Location $repoRoot
    try {
        $runningServices = Invoke-DockerCompose -Arguments @('ps', '--services', '--filter', 'status=running') -IgnoreErrors
        if (-not ($runningServices -contains 'mongo')) {
            Write-Info 'Mongo service is not running. Starting mongo container...'
            Invoke-DockerCompose -Arguments @('up', '-d', 'mongo') | Out-Null
            Write-Info 'Waiting for Mongo container to be healthy...'
            Invoke-DockerCompose -Arguments @('wait', 'mongo') -IgnoreErrors | Out-Null
        }

        $jsonFiles = Get-ChildItem -Path $demoDir -Filter '*.json' -File
        if (-not $jsonFiles) {
            Write-WarningMessage "No JSON files found in '$demoDir'. Nothing to import."
            return
        }

        foreach ($file in $jsonFiles) {
            $nameSegments = $file.BaseName -split '\.'
            $collectionName = if ($nameSegments.Count -ge 2) { $nameSegments[1] } else { $nameSegments[0] }

            if (-not $collectionName) {
                Write-WarningMessage "Skipping file '$($file.Name)' (cannot determine collection name)."
                continue
            }

            $containerPath = "/tmp/import-$($collectionName)-$([System.IO.Path]::GetRandomFileName()).json"

            Write-Info "Copying '$($file.Name)' into Mongo container..."
            Invoke-DockerCompose -Arguments @('cp', $file.FullName, "mongo:$containerPath") | Out-Null

            $importArgs = @(
                'exec', '-T', 'mongo', 'mongoimport',
                "--uri=$MongoUri",
                "--db=$Database",
                "--collection=$collectionName",
                "--file=$containerPath",
                '--jsonArray',
                '--maintainInsertionOrder',
                '--numInsertionWorkers=4'
            )

            Write-Info "Importing '$($file.Name)' into collection '$collectionName'..."

            try {
                Invoke-DockerCompose -Arguments $importArgs | Out-Null
                Write-Info "Successfully imported '$($file.Name)'."
            }
            catch {
                Write-ErrorMessage "Import failed for '$($file.Name)': $($_.Exception.Message)"
            }
            finally {
                Invoke-DockerCompose -Arguments @('exec', '-T', 'mongo', 'rm', '-f', $containerPath) -IgnoreErrors | Out-Null
            }
        }
    }
    finally {
        Pop-Location
    }
}
catch {
    Write-ErrorMessage $_.Exception.Message
    exit 1
}