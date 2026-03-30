import { BlobServiceClient } from '@azure/storage-blob';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const CONN_STR = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!CONN_STR) {
    console.error('Error: AZURE_STORAGE_CONNECTION_STRING environment variable is not set.');
    process.exit(1);
}

const PDF_DIR = process.argv[2];
if (!PDF_DIR) {
    console.error('Usage: node scripts/upload-problem-statements.mjs <path-to-pdf-directory>');
    process.exit(1);
}

const blobServiceClient = BlobServiceClient.fromConnectionString(CONN_STR);

async function getContainer() {
    const container = blobServiceClient.getContainerClient('data');
    await container.createIfNotExists();
    return container;
}

async function main() {
    const container = await getContainer();
    const entries = await readdir(PDF_DIR);
    const pdfs = entries.filter(f => f.endsWith('.pdf'));

    if (pdfs.length === 0) {
        console.log('No PDF files found in the specified directory.');
        process.exit(0);
    }

    let uploaded = 0;
    let failed = 0;

    for (const pdf of pdfs) {
        const problemId = pdf.slice(0, -4); // strip .pdf
        const localPath = path.join(PDF_DIR, pdf);
        const blobPath = `${problemId}/statement.pdf`;

        try {
            const content = await readFile(localPath);
            await container.getBlockBlobClient(blobPath).upload(content, content.length);
            console.log(`  ✓ ${pdf} → ${blobPath}`);
            uploaded++;
        } catch (err) {
            console.warn(`  ✗ ${pdf} — ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`);
}

main().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
