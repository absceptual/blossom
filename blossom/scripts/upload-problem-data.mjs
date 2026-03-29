import { BlobServiceClient } from '@azure/storage-blob';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const CONN_STR = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!CONN_STR) {
    console.error('Error: AZURE_STORAGE_CONNECTION_STRING environment variable is not set.');
    process.exit(1);
}

const PROBLEMS_DIR = process.argv[2];
if (!PROBLEMS_DIR) {
    console.error('Usage: node scripts/upload-problem-data.mjs <path-to-problems-directory>');
    process.exit(1);
}

const blobServiceClient = BlobServiceClient.fromConnectionString(CONN_STR);

async function getContainer() {
    const container = blobServiceClient.getContainerClient('data');
    await container.createIfNotExists();
    return container;
}

async function uploadBlob(container, blobPath, localPath) {
    const content = await readFile(localPath);
    await container.getBlockBlobClient(blobPath).upload(content, content.length);
}

async function main() {
    const container = await getContainer();

    // Upload example.java starter template (required for first-time code load)
    const examplePath = new URL('../data/example', import.meta.url).pathname;
    try {
        await uploadBlob(container, 'example.java', examplePath);
        console.log('✓ example.java');
    } catch (err) {
        console.warn(`✗ example.java — ${err.message}`);
    }

    const entries = await readdir(PROBLEMS_DIR, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());

    let uploaded = 0;
    let skipped = 0;

    for (const folder of folders) {
        const folderPath = path.join(PROBLEMS_DIR, folder.name);

        // Derive problem name from the .dat file in sample/ rather than parsing the folder name
        let problemName;
        try {
            const sampleFiles = await readdir(path.join(folderPath, 'sample'));
            const datFile = sampleFiles.find(f => f.endsWith('.dat'));
            if (!datFile) throw new Error('no .dat file found');
            problemName = datFile.slice(0, -4); // strip .dat
        } catch {
            console.warn(`  SKIP ${folder.name} — no sample/*.dat found`);
            skipped++;
            continue;
        }

        console.log(`\n${folder.name} → ${problemName}`);

        for (const subfolder of ['sample', 'judge']) {
            for (const ext of ['dat', 'out']) {
                const localPath = path.join(folderPath, subfolder, `${problemName}.${ext}`);
                const blobPath = `${problemName}/${subfolder}/${problemName}.${ext}`;
                try {
                    await uploadBlob(container, blobPath, localPath);
                    console.log(`  ✓ ${blobPath}`);
                    uploaded++;
                } catch (err) {
                    console.warn(`  ✗ ${blobPath} — ${err.message}`);
                    skipped++;
                }
            }
        }
    }

    console.log(`\nDone. ${uploaded} uploaded, ${skipped} skipped.`);
}

main().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
