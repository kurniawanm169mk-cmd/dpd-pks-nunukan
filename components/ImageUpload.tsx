import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    currentImageUrl?: string;
    onUpload: (url: string) => void;
    bucketName?: string;
    label?: string;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    currentImageUrl,
    onUpload,
    bucketName = 'images',
    label = 'Upload Image',
    className = '',
}) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

            setPreviewUrl(data.publicUrl);
            onUpload(data.publicUrl);
        } catch (error) {
            alert('Error uploading image: ' + (error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(undefined);
        onUpload('');
    };

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

            <div className="flex items-center gap-4">
                {previewUrl ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <span className="text-gray-400 text-sm">No image</span>
                    </div>
                )}

                <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="-ml-1 mr-2 h-4 w-4" />
                                Select Image
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;
