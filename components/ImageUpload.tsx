import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ImageCropModal from './ImageCropModal';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
    currentImageUrl?: string;
    onUpload: (url: string) => void;
    label?: string;
    bucketName?: string;
    className?: string;
    layout?: 'horizontal' | 'vertical';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    currentImageUrl,
    onUpload,
    label = "Upload Image",
    bucketName = "images",
    className = "",
    layout = "horizontal"
}) => {
    const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
    const [uploading, setUploading] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    // Sync preview with currentImageUrl prop changes
    useEffect(() => {
        setPreviewUrl(currentImageUrl || '');
    }, [currentImageUrl]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview URL for cropping
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setSelectedFileName(file.name);
        setShowCropModal(true);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setShowCropModal(false);
        setUploading(true);

        try {
            // Compress image
            const compressionOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            };

            // Convert Blob to File for compression
            const file = new File([croppedBlob], selectedFileName, { type: croppedBlob.type });
            const compressedFile = await imageCompression(file, compressionOptions);

            const fileExt = selectedFileName.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload compressed file to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, compressedFile);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            setPreviewUrl(publicUrl);
            onUpload(publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Gagal mengupload gambar');
        } finally {
            setUploading(false);
            if (selectedImage) {
                URL.revokeObjectURL(selectedImage);
            }
            setSelectedImage(null);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage);
        }
        setSelectedImage(null);
    };

    const handleRemove = () => {
        setPreviewUrl('');
        onUpload('');
    };

    return (
        <>
            <div className={`${className}`}>
                {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

                <div className={`flex gap-3 ${layout === 'vertical' ? 'flex-col items-start' : 'items-center flex-wrap sm:flex-nowrap'}`}>
                    {/* Preview Area */}
                    {previewUrl ? (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 group bg-gray-50">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={handleRemove}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                type="button"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className={`${layout === 'vertical' ? 'w-full max-w-[150px]' : 'flex-1 min-w-[120px]'}`}>
                        <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors w-full">
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                                    {previewUrl ? 'Ganti' : 'Pilih'}
                                </>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                            />
                        </label>
                        <p className="text-[10px] text-gray-500 mt-1">
                            Max 5MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {showCropModal && selectedImage && (
                <ImageCropModal
                    imageUrl={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={1}
                />
            )}
        </>
    );
};

export default ImageUpload;
