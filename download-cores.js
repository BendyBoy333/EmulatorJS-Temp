
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core files that need to be downloaded for basic functionality
// Comprehensive list of cores based on package.json dependencies
const CORES_TO_DOWNLOAD = [
    // Core emulator cores
    'snes9x-legacy-wasm.data',
    'snes9x-wasm.data',
    'fceumm-legacy-wasm.data',
    'fceumm-wasm.data',
    'nestopia-legacy-wasm.data',
    'nestopia-wasm.data',
    'gambatte-legacy-wasm.data',
    'gambatte-wasm.data',
    'mgba-legacy-wasm.data',
    'mgba-wasm.data',
    'beetle_vb-legacy-wasm.data',
    'beetle_vb-wasm.data',
    'mupen64plus_next-legacy-wasm.data',
    'mupen64plus_next-wasm.data',
    'parallel_n64-legacy-wasm.data',
    'parallel_n64-wasm.data',
    'melonds-legacy-wasm.data',
    'melonds-wasm.data',
    'desmume-legacy-wasm.data',
    'desmume-wasm.data',
    'desmume2015-legacy-wasm.data',
    'desmume2015-wasm.data',
    'genesis_plus_gx-legacy-wasm.data',
    'genesis_plus_gx-wasm.data',
    'picodrive-legacy-wasm.data',
    'picodrive-wasm.data',
    'yabause-legacy-wasm.data',
    'yabause-wasm.data',
    'pcsx_rearmed-legacy-wasm.data',
    'pcsx_rearmed-wasm.data',
    'mednafen_psx_hw-legacy-wasm.data',
    'mednafen_psx_hw-wasm.data',
    'opera-legacy-wasm.data',
    'opera-wasm.data',
    'handy-legacy-wasm.data',
    'handy-wasm.data',
    'virtualjaguar-legacy-wasm.data',
    'virtualjaguar-wasm.data',
    'stella2014-legacy-wasm.data',
    'stella2014-wasm.data',
    'a5200-legacy-wasm.data',
    'a5200-wasm.data',
    'prosystem-legacy-wasm.data',
    'prosystem-wasm.data',
    'mednafen_pce-legacy-wasm.data',
    'mednafen_pce-wasm.data',
    'mednafen_pcfx-legacy-wasm.data',
    'mednafen_pcfx-wasm.data',
    'mednafen_ngp-legacy-wasm.data',
    'mednafen_ngp-wasm.data',
    'mednafen_wswan-legacy-wasm.data',
    'mednafen_wswan-wasm.data',
    'gearcoleco-legacy-wasm.data',
    'gearcoleco-wasm.data',
    'fbneo-legacy-wasm.data',
    'fbneo-wasm.data',
    'fbalpha2012_cps1-legacy-wasm.data',
    'fbalpha2012_cps1-wasm.data',
    'fbalpha2012_cps2-legacy-wasm.data',
    'fbalpha2012_cps2-wasm.data',
    'mame2003-legacy-wasm.data',
    'mame2003-wasm.data',
    'mame2003_plus-legacy-wasm.data',
    'mame2003_plus-wasm.data',
    'puae-legacy-wasm.data',
    'puae-wasm.data',
    'smsplus-legacy-wasm.data',
    'smsplus-wasm.data',
    'ppsspp-legacy-wasm.data',
    'ppsspp-wasm.data',
    // Vice cores
    'vice_x64-legacy-wasm.data',
    'vice_x64-wasm.data',
    'vice_x64sc-legacy-wasm.data',
    'vice_x64sc-wasm.data',
    'vice_x128-legacy-wasm.data',
    'vice_x128-wasm.data',
    'vice_xpet-legacy-wasm.data',
    'vice_xpet-wasm.data',
    'vice_xplus4-legacy-wasm.data',
    'vice_xplus4-wasm.data',
    'vice_xvic-legacy-wasm.data',
    'vice_xvic-wasm.data',
    // Additional cores
    'fuse-legacy-wasm.data',
    'fuse-wasm.data',
    'cap32-legacy-wasm.data',
    'cap32-wasm.data',
    'crocods-legacy-wasm.data',
    'crocods-wasm.data',
    'prboom-legacy-wasm.data',
    'prboom-wasm.data',
    '81-legacy-wasm.data',
    '81-wasm.data'
];

const REPORTS_TO_DOWNLOAD = [
    'snes9x.json',
    'fceumm.json',
    'nestopia.json',
    'gambatte.json',
    'mgba.json',
    'beetle_vb.json',
    'mupen64plus_next.json',
    'parallel_n64.json',
    'melonds.json',
    'desmume.json',
    'desmume2015.json',
    'genesis_plus_gx.json',
    'picodrive.json',
    'yabause.json',
    'pcsx_rearmed.json',
    'mednafen_psx_hw.json',
    'opera.json',
    'handy.json',
    'virtualjaguar.json',
    'stella2014.json',
    'a5200.json',
    'prosystem.json',
    'mednafen_pce.json',
    'mednafen_pcfx.json',
    'mednafen_ngp.json',
    'mednafen_wswan.json',
    'gearcoleco.json',
    'fbneo.json',
    'fbalpha2012_cps1.json',
    'fbalpha2012_cps2.json',
    'mame2003.json',
    'mame2003_plus.json',
    'puae.json',
    'smsplus.json',
    'ppsspp.json',
    'vice_x64.json',
    'vice_x64sc.json',
    'vice_x128.json',
    'vice_xpet.json',
    'vice_xplus4.json',
    'vice_xvic.json',
    'fuse.json',
    'cap32.json',
    'crocods.json',
    'prboom.json',
    '81.json'
];

const BASE_CDN_URL = 'https://cdn.emulatorjs.org/stable/data';
const CORES_DIR = path.join(__dirname, 'data', 'cores');
const REPORTS_DIR = path.join(__dirname, 'data', 'cores', 'reports');

// Create directories if they don't exist
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        // Check if file already exists
        if (fs.existsSync(filePath)) {
            console.log(`File already exists, skipping: ${path.basename(filePath)}`);
            resolve();
            return;
        }

        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                let downloadedBytes = 0;
                const totalBytes = parseInt(response.headers['content-length'] || '0');
                
                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    if (totalBytes > 0) {
                        const percentage = ((downloadedBytes / totalBytes) * 100).toFixed(1);
                        process.stdout.write(`\rDownloading ${path.basename(filePath)}: ${percentage}%`);
                    }
                });
                
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`\nDownloaded: ${path.basename(filePath)}`);
                    resolve();
                });
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirects
                file.close();
                fs.unlinkSync(filePath); // Remove incomplete file
                downloadFile(response.headers.location, filePath).then(resolve).catch(reject);
            } else {
                file.close();
                fs.unlinkSync(filePath); // Remove incomplete file
                console.log(`\nFailed to download ${url}: ${response.statusCode}`);
                resolve(); // Continue with other downloads
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Remove incomplete file
            }
            console.log(`\nError downloading ${url}:`, err.message);
            resolve(); // Continue with other downloads
        });
    });
}

async function downloadCores() {
    console.log('Downloading EmulatorJS cores...');
    
    // Download core files
    for (const coreFile of CORES_TO_DOWNLOAD) {
        const url = `${BASE_CDN_URL}/cores/${coreFile}`;
        const filePath = path.join(CORES_DIR, coreFile);
        await downloadFile(url, filePath);
    }
    
    // Download report files
    for (const reportFile of REPORTS_TO_DOWNLOAD) {
        const url = `${BASE_CDN_URL}/cores/reports/${reportFile}`;
        const filePath = path.join(REPORTS_DIR, reportFile);
        await downloadFile(url, filePath);
    }
    
    console.log('Core download completed!');
}

async function downloadMinifiedFiles() {
    console.log('Downloading minified files...');
    
    const minifiedFiles = [
        { url: `${BASE_CDN_URL}/emulator.min.js`, path: path.join(__dirname, 'data', 'emulator.min.js') },
        { url: `${BASE_CDN_URL}/emulator.min.css`, path: path.join(__dirname, 'data', 'emulator.min.css') }
    ];
    
    for (const file of minifiedFiles) {
        await downloadFile(file.url, file.path);
    }
    
    console.log('Minified files download completed!');
}

// Run the downloads
async function main() {
    try {
        await downloadMinifiedFiles();
        await downloadCores();
        console.log('All downloads completed successfully!');
    } catch (error) {
        console.error('Download failed:', error);
    }
}

main();
