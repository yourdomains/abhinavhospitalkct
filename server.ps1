# Simple Static HTTP Server in PowerShell using System.Net.HttpListener
param (
    [int]$Port = 1254,
    [string]$Root = $PSScriptRoot
)

if (-not $Root) {
    $Root = (Get-Location).Path
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".zip"  = "application/zip"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
    Write-Output "HTTP server running at: http://localhost:$Port/"
    Write-Output "Serving files from: $Root"
} catch {
    Write-Error "Failed to start HttpListener: $_"
    exit 1
}

try {
    while ($listener.IsListening) {
        $context = $null
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $urlPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "index.html"
            }
            if ($urlPath -eq "download" -or $urlPath -eq "download/" -or $urlPath -eq "download.zip") {
                $urlPath = "abhinav-hospital-website.zip"
            }

            # Normalize path
            $safePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $urlPath))

            # Prevent directory traversal
            if (-not $safePath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }

            if (Test-Path $safePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($safePath).ToLower()
                $contentType = "application/octet-stream"
                if ($mimeTypes.ContainsKey($ext)) {
                    $contentType = $mimeTypes[$ext]
                }

                $bytes = [System.IO.File]::ReadAllBytes($safePath)
                $response.ContentType = $contentType
                $response.StatusCode = 200
                $response.ContentLength64 = $bytes.Length
                $response.AddHeader("Access-Control-Allow-Origin", "*")

                if ($ext -eq ".zip") {
                    $fileName = [System.IO.Path]::GetFileName($safePath)
                    $response.AddHeader("Content-Disposition", "attachment; filename=`"$fileName`"")
                }

                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $msg.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
        } catch {
            # Ignore client disconnects
        } finally {
            if ($context -and $context.Response) {
                try { $context.Response.Close() } catch {}
            }
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
