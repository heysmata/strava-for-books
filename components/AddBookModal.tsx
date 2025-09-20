import React, { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Book } from '../types';
import { fetchBookMetadataFromCover } from '../services/geminiService';
import { LoaderIcon, XIcon, UploadIcon } from './Icons';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

interface AddBookModalProps {
  onClose: () => void;
  onAddBook: (book: Omit<Book, 'id' | 'currentPage' | 'status' | 'quotes'>) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onAddBook }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalPages, setTotalPages] = useState(300);
  const [content, setContent] = useState('');

  const processFile = useCallback(async (file: File) => {
    setIsFetching(true);
    setShowManualForm(false);
    
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("Failed to read file.");
          }
          const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          // 1. Extract cover image from first page
          const firstPage = await pdf.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (!context) {
            throw new Error("Could not get canvas context");
          }

          await firstPage.render({ canvasContext: context, viewport: viewport }).promise;
          const coverImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

          // 2. Extract all text content
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
              fullText += pageText + '\n\n';
          }
          setContent(fullText);

          // 3. Call Gemini with the cover image
          const details = await fetchBookMetadataFromCover(coverImageBase64, 'image/jpeg');
          
          setTitle(details.title);
          setAuthor(details.author);
          setSummary(details.summary);
          setCoverImage(details.coverImage);
          // Use PDF page count as a fallback if Gemini can't determine it
          setTotalPages(details.totalPages > 0 ? details.totalPages : pdf.numPages);
          
          setShowManualForm(true);
        } catch(e) {
            console.error("Error processing PDF:", e);
            alert("Could not process the PDF file. Please try again or enter details manually.");
            setShowManualForm(true);
        } finally {
            setIsFetching(false);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
        console.error("Failed to process PDF:", error);
        alert("Could not process the PDF file. Please try again or enter details manually.");
        setShowManualForm(true);
        setIsFetching(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
        processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !summary || !coverImage || totalPages <= 0) {
      alert('Please fill out all fields.');
      return;
    }
    onAddBook({
      title,
      author,
      summary,
      coverImage,
      totalPages,
      content,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg relative animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Add a New Book</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {isFetching ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
                <LoaderIcon className="w-8 h-8 text-accent" />
                <p className="text-text-secondary">Analyzing your book...</p>
            </div>
        ) : !showManualForm ? (
            <div className="p-6">
                <label 
                    htmlFor="file-upload" 
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-border-color border-dashed rounded-lg cursor-pointer bg-primary hover:bg-border-color transition-colors"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-10 h-10 mb-3 text-text-secondary"/>
                        <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-text-secondary">PDF files only</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
                <div className="text-center mt-4">
                    <button onClick={() => setShowManualForm(true)} className="text-sm text-accent hover:underline">
                        Or enter details manually
                    </button>
                </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title-manual" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                        <input type="text" id="title-manual" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-primary border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label htmlFor="author-manual" className="block text-sm font-medium text-text-secondary mb-1">Author</label>
                        <input type="text" id="author-manual" value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full bg-primary border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label htmlFor="coverImage" className="block text-sm font-medium text-text-secondary mb-1">Cover Image URL</label>
                        <input type="text" id="coverImage" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} required className="w-full bg-primary border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label htmlFor="totalPages" className="block text-sm font-medium text-text-secondary mb-1">Total Pages</label>
                        <input type="number" id="totalPages" value={totalPages} onChange={(e) => setTotalPages(parseInt(e.target.value, 10))} required min="1" className="w-full bg-primary border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-text-secondary mb-1">Summary</label>
                        <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} required rows={4} className="w-full bg-primary border border-border-color rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-highlight text-white px-6 py-2 rounded-md font-semibold hover:bg-green-600 transition-colors duration-200">
                        Add Book
                        </button>
                    </div>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default AddBookModal;