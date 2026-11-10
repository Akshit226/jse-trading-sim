Add-Type -AssemblyName System.Speech

$anchorImg = "D:\Akshit\classroom-trading-sim\public\news-anchor.jpg"
$outputDir = "D:\Akshit\classroom-trading-sim\public\videos\news"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$scenarios = @(
    @{
        id = "r1-tatamotors-ev-surge";
        text = "Attention trading floor: Breaking news alert. Tata Motors Net Profit Surges 74 percent on record electric vehicle sales and a massive turnaround at Jaguar Land Rover. Institutional buy orders are flooding the automotive desk."
    },
    @{
        id = "r1-zomato-blinkit-profits";
        text = "Breaking news from consumer tech: Blinkit achieves operational breakeven! Zomato quick commerce revenue explodes 115 percent year over year, with 10-minute grocery volume eclipsing food delivery."
    },
    @{
        id = "r2-rbi-rate-hike-banking";
        text = "Urgent central bank policy alert: The Reserve Bank of India delivers a surprise 50 basis points repo rate hike and orders banks to curb unsecured credit. HDFC Bank and State Bank of India face immediate margin compression."
    },
    @{
        id = "r2-us-tech-spending-cut";
        text = "Global market warning: Wall Street mega-banks freeze discretionary technology consulting contracts amid recessionary concerns. Infosys and Tata Consultancy Services cut annual revenue guidance."
    },
    @{
        id = "r3-adani-hindenburg-shock";
        text = "Explosive corporate news flash: A United States short-seller report alleges offshore accounting fraud and high leverage at the Adani Group. Adani Enterprises plunges 28 percent in heavy panic selling."
    },
    @{
        id = "r3-reliance-jio-green-energy";
        text = "Major conglomerate update: Reliance Industries unveils a 75,000 crore green energy gigafactory roadmap and prepares a historic 110 billion dollar valuation mega-IPO for Jio Platforms."
    },
    @{
        id = "r4-hybrid-gst-concession";
        text = "Government policy announcement: The Union Ministry proposes a 50 percent GST concession for clean hybrid vehicles. Maruti Suzuki explodes upward with over 150,000 backlogged hybrid orders."
    },
    @{
        id = "r4-fii-sovereign-inflow";
        text = "Sovereign liquidity alert: Foreign institutional investors pump a record 12,500 crore rupees into Indian bluechips in a single trading session, sparking a market-wide tsunami across all frontline heavyweights."
    },
    @{
        id = "r5-itc-hotels-demerger-dividend";
        text = "Historic value unlocking news: The ITC board approves a landmark 1-for-1 hotel demerger and declares an unprecedented 15 rupees per share special cash dividend, triggering ferocious short covering."
    },
    @{
        id = "r5-tcs-mega-ai-contract";
        text = "Enterprise AI breakthrough: Tata Consultancy Services signs a landmark 1 billion dollar generative AI enterprise transformation contract with a European retail giant, driving an explosive end-of-round tech rally."
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
