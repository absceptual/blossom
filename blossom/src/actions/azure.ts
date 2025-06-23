
import { BlobServiceClient  } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error('Azure Storage Connection string not found');
}

// Create the BlobServiceClient object with connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

async function getDataContainer() {
    const dataContainerClient = blobServiceClient.getContainerClient("data")
    await dataContainerClient.createIfNotExists();

    return dataContainerClient;
}

export async function uploadFile(path, data, length = data.length) {
    const dataContainer = await getDataContainer();

    const blockBlobClient = dataContainer.getBlockBlobClient(path);
    await blockBlobClient.upload(data, length)
}

export async function retrieveFile(path) {
    const dataContainer = await getDataContainer();
    const streamToBuffer = (stream) => {  
        return new Promise((resolve, reject) => {
            const chunks = []
            stream.on("data", (data) => {
                chunks.push(typeof data === "string" ? Buffer.from(data) : data)
            });

            stream.on("end", () => {
                resolve(Buffer.concat(chunks))
            });

            stream.on("error", reject);
        });
    }

    const blockBlobClient = dataContainer.getBlockBlobClient(path);
    const downloadResponse = await blockBlobClient.download();
    const data = await streamToBuffer(downloadResponse.readableStreamBody);

    return data;
}