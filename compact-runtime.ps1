# Keep only the platform used by this local project. npm ci restores all binaries.
$ErrorActionPreference = 'Stop'
$taskRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$expectedRoot = [System.IO.Path]::GetFullPath('D:\project\CVList')
if ($taskRoot -ne $expectedRoot) { throw 'This cleanup script is only for D:\project\CVList.' }
$platformFolders = @(
    'node_modules\onnxruntime-node\bin\napi-v3\darwin',
    'node_modules\onnxruntime-node\bin\napi-v3\linux',
    'node_modules\onnxruntime-node\bin\napi-v3\win32\arm64'
)
foreach ($relative in $platformFolders) {
    $target = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $relative))
    if (-not $target.StartsWith($taskRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Cleanup path escaped the project.' }
    if (Test-Path -LiteralPath $target) {
        Write-Output $target
        Remove-Item -LiteralPath $target -Recurse -Force
    }
}
