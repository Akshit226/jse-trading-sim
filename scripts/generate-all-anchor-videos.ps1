Add-Type -AssemblyName System.Speech

$anchorImg = "D:\Akshit\classroom-trading-sim\public\news-anchor.jpg"
$outputDir = "D:\Akshit\classroom-trading-sim\public\videos\news"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$scenarios = @(
    @{
        id = "r1-tataelxsi-earnings";
        text = "Attention trading floor: Breaking news alert. Tata Elxsi Net Profit Surges 38 percent on major autonomous electric vehicle design wins. Operating margins expand to record highs as institutional buy orders flood the market."
    },
    @{
        id = "r1-fmcg-festive-demand";
        text = "Breaking news from the consumer desk: Festive demand surge triggers record supply shipments for Colgate Palmolive and Radico Khaitan. Rural consumer spending beats street estimates."
    },
    @{
        id = "r2-inflation-fmcg";
        text = "Urgent market warning! Emergency alert. Inflation spike: Palm oil and crude packaging derivatives surge 18 percent. FMCG margins face immediate compression across consumer staples."
    },
    @{
        id = "r2-rbi-rate-hike";
        text = "Central bank policy alert: Reserve Bank of India delivers surprise 50 basis points repo rate hike. Algorithmic desks trigger widespread sell-offs across high-growth technology equities."
    },
    @{
        id = "r3-global-slowdown";
        text = "Global market shock: Western banking turmoil freezes offshore tech consulting spend. Capital expenditure cuts impact enterprise cloud transition contracts."
    },
    @{
        id = "r3-coforge-ai-deal";
        text = "Major positive update: Coforge seals massive 400 million dollar multi-year Generative AI transformation contract. Order book reaches a lifetime high."
    },
    @{
        id = "r4-excise-policy";
        text = "Government policy announcement: State excise duties eased and retail licensing simplified. United Breweries and Radico Khaitan gain immediate pricing power."
    },
    @{
        id = "r4-fii-mega-inflow";
        text = "Institutional capital alert: Foreign institutional investors pump record 8,200 crore rupees into Indian equities in a single day, driving broad-market rallies."
    },
    @{
        id = "r5-ofss-mega-dividend";
        text = "Special dividend announcement: Oracle Financial Services declares record 220 rupees per share interim dividend. High-yield funds trigger ferocious accumulation."
    },
    @{
        id = "r5-brokerage-upgrade";
        text = "Wall Street upgrade alert: Global investment banks initiate Conviction Buy ratings on Gillette and Tata Elxsi, citing superior pricing power and debt-free balance sheets."
    }
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Zira Desktop")
$synth.Rate = 0

foreach ($sc in $scenarios) {
    $tempWav = "$env:TEMP\$($sc.id).wav"
    $mp4Out = "$outputDir\$($sc.id).mp4"
    
    Write-Host "[Synthesizing Audio] $($sc.id)..."
    $synth.SetOutputToWaveFile($tempWav)
    $synth.Speak($sc.text)
    
    Write-Host "[Encoding MP4 Video] $($sc.id)..."
    $cmd = "ffmpeg -y -loop 1 -i `"$anchorImg`" -i `"$tempWav`" -c:v libx264 -tune stillimage -c:a aac -b:a 128k -pix_fmt yuv420p -shortest `"$mp4Out`""
    cmd.exe /c $cmd 2>&1 | Out-Null
    
    if (Test-Path $tempWav) {
        Remove-Item $tempWav -Force
    }
    
    if (Test-Path $mp4Out) {
        $size = (Get-Item $mp4Out).Length
        Write-Host "✓ Generated $mp4Out ($size bytes)"
    } else {
        Write-Warning "Failed to generate $mp4Out"
    }
}

$synth.Dispose()
Write-Host "All anchor videos generated successfully!"
