
import React from 'react';
import { Upload } from 'lucide-react';
import { FormData } from '../../types/diagnosticForm';

interface FileUploadSectionProps {
  formData: FormData;
  onFileUpload: (files: FileList | null) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ formData, onFileUpload }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Upload photos, dash screenshots, or videos
      </label>
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">Click to upload or drag and drop files here</p>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => onFileUpload(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
        >
          Choose Files
        </label>
      </div>
      {formData.uploadedFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-slate-300 mb-2">Uploaded files:</p>
          <ul className="space-y-1">
            {formData.uploadedFiles.map((file, index) => (
              <li key={index} className="text-sm text-slate-400">
                {file.name} ({Math.round(file.size / 1024)}KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default FileUploadSection;
