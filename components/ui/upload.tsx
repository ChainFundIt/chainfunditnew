import React, { useRef, useState } from 'react';
import { useFileUpload } from '@/hooks/use-upload';
import { Plus, Image as LuImage } from 'lucide-react';

interface UploadProps {
  onUpload: (url: string) => void;
  type: 'imageUpload' | 'documentUpload';
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: React.ReactNode;
  previewUrl?: string;
}

export function Upload({ 
  onUpload, 
  type, 
  accept = "image/*", 
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  children,
  previewUrl
}: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, uploadError } = useFileUpload();
  const [localPreview, setLocalPreview] = useState<string>('');

  // Log component initialization
  React.useEffect(() => {
    console.log('🎯 Upload component initialized with props:', {
      type,
      accept,
      maxSize,
      previewUrl: previewUrl ? 'Present' : 'None',
      previewUrlValue: previewUrl,
      hasOnUploadCallback: typeof onUpload === 'function'
    });
  }, []);

  // Log when previewUrl prop changes
  React.useEffect(() => {
    console.log('🔄 previewUrl prop changed:', previewUrl);
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 Upload process started');
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2)
    });

    if (file.size > maxSize) {
      console.log('❌ File too large:', {
        fileSize: file.size,
        maxSize: maxSize,
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
        maxSizeMB: (maxSize / 1024 / 1024).toFixed(2)
      });
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    console.log('✅ File size validation passed');

    // Create local preview immediately
    console.log('🖼️ Creating local preview...');
    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);
    console.log('✅ Local preview created:', localUrl);

    try {
      console.log('📤 Starting file upload to server...');
      console.log('📤 Upload parameters:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: type
      });
      
      const result = await uploadFile(file, type);
      
      console.log('📥 Upload result received:', result);
      
      if (result && result.url) {
        console.log('✅ Upload successful! Server URL:', result.url);
        onUpload(result.url);
        console.log('🔄 Calling onUpload callback with URL:', result.url);
        // Clear local preview once upload is complete
        setLocalPreview('');
        console.log('🧹 Local preview cleared');
      } else {
        console.log('❌ Upload result is invalid:', result);
      }
    } catch (error) {
      console.error('❌ Upload error occurred:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      // Clear local preview on error
      setLocalPreview('');
      console.log('🧹 Local preview cleared due to error');
    }
  };

  const currentPreview = previewUrl || localPreview;

  // Log component state changes
  React.useEffect(() => {
    console.log('🔄 Upload component state changed:', {
      isUploading,
      uploadError,
      localPreview: localPreview ? 'Present' : 'None',
      previewUrl: previewUrl ? 'Present' : 'None',
      currentPreview: currentPreview ? 'Present' : 'None',
      previewUrlValue: previewUrl,
      localPreviewValue: localPreview,
      currentPreviewValue: currentPreview
    });
  }, [isUploading, uploadError, localPreview, previewUrl, currentPreview]);

  const handleClick = () => {
    console.log('👆 Upload area clicked');
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="upload-input"
          className="w-[200px] md:w-[360px] h-[200px] md:h-[360px] flex items-center justify-center cursor-pointer bg-center bg-cover transition-colors"
          style={{
            backgroundImage: currentPreview
              ? `url(${currentPreview})`
              : `url('/images/image.png')`,
          }}
          title="Upload campaign image"
          onClick={handleClick}
        >
        </label>
        
        {/* Plus button positioned to match original design */}
        <button
          type="button"
          className="w-8 md:w-[56px] h-8 md:h-[56px] bg-[#104901] flex items-center justify-center text-white absolute right-[118px] md:right-[160px] 2xl:right-[200px] bottom-6 md:bottom-11"
          onClick={handleClick}
          disabled={isUploading}
        >
          <Plus className="md:text-4xl text-lg" size={36} />
        </button>
      </div>
      
      {isUploading && (
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      )}
      
      {uploadError && (
        <p className="text-red-500 text-sm mt-2 text-center">{uploadError}</p>
      )}
      
      {children}
    </div>
  );
}
