import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

interface ProcessedContent {
  text: string;
  metadata: {
    pageCount: number;
    info: any;
    version: string;
  };
  pages: {
    pageNumber: number;
    text: string;
  }[];
}

async function processPDF(filePath: string): Promise<ProcessedContent> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    const data = await pdfParse(dataBuffer, {
      max: 0, // No page limit
      version: 'v2.0.550'
    });

    const pages = data.text.split('\f').map((text: string, index: number) => ({
      pageNumber: index + 1,
      text: text.trim()
    }));

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        info: data.info,
        version: data.version
      },
      pages
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

async function main() {
  const pdfPath = process.argv[2];
  
  if (!pdfPath) {
    console.error('Please provide a PDF file path');
    process.exit(1);
  }

  try {
    const result = await processPDF(pdfPath);
    
    const outputDir = path.join('processed', path.basename(pdfPath, '.pdf'));
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'raw-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`Processed PDF saved to: ${outputPath}`);
    console.log(`Total pages: ${result.metadata.pageCount}`);
    
    if (result.pages.length > 0) {
      console.log('\nSample from first page:');
      console.log('-------------------');
      console.log(result.pages[0].text.slice(0, 500) + '...');
    }
  } catch (error) {
    console.error('Failed to process PDF:', error);
    process.exit(1);
  }
}

main(); 