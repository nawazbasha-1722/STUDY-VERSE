import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromFile = async (filePath, originalName) => {
  const ext = originalName.split('.').pop().toLowerCase();

  try {
    if (ext === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const parsedData = await pdfParse(dataBuffer);
      return parsedData.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === 'pptx' || ext === 'ppt') {
      // Mock PPT text extractor (or parsing XML files inside presentation structures)
      return `[Presentation Document: ${originalName}]\nSlide 1: Title Slide - Introduction\nSlide 2: Major Core Concepts discussion.\nSlide 3: Questions and Answers summary.\nSlide 4: References and study milestones list.`;
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error(`Error parsing text from file (${originalName}):`, error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
};
