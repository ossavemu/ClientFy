import fs from 'fs';

export const removeFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    } else {
      console.log(`File ${filePath} does not exist.`);
    }
  } catch (error) {
    console.error(`Error removing file at ${filePath}: ${error.message}`);
  }
};
