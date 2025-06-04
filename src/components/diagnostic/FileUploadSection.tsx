
import React from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadSectionProps {
  formData: { uploadedFiles: File[] };
  onFileUpload: (files: FileList | null) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ formData, onFileUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e.target.files);
  };

  const removeFile = (index: number) => {
    // This would need to be handled by the parent component
    // For now, we'll just show the files
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Upload Evidence (Photos, Videos, Documents)
        </label>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <div className="space-y-2">
            <p className="text-slate-300">
              Drag and drop files here, or{' '}
              <label className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-slate-500">
              Supports: Images, Videos, PDF, Word documents
            </p>
          </div>
        </div>
      </div>

      {formData.uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Uploaded Files:</h4>
          <div className="space-y-2">
            {formData.uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-slate-300">
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-slate-400 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
