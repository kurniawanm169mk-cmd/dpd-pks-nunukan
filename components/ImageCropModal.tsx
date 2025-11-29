import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Crop } from 'lucide-react';

interface ImageCropModalProps {
    imageUrl: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    imageUrl,
    onCropComplete,
    onCancel,
    aspectRatio = 16 / 9
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = useCallback((crop: { x: number; y: number }) => {
        setCrop(crop);
    }, []);

    const onZoomChange = useCallback((zoom: number) => {
        setZoom(zoom);
    }, []);

    const onCropAreaChange = useCallback((_: any, croppedAreaPixels: CropArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createCroppedImage = async () => {
        if (!croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const image = new Image();
            image.src = imageUrl;

            await new Promise((resolve) => {
                image.onload = resolve;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    onCropComplete(blob);
                }
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error('Error cropping image:', error);
            alert('Gagal memotong gambar. Silakan coba lagi.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Crop size={20} />
                            Potong & Atur Gambar
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Geser, zoom, dan atur posisi gambar sesuai keinginan</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="flex-1 relative bg-gray-900" style={{ minHeight: '400px' }}>
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropAreaChange}
                    />
                </div>

                {/* Controls */}
                <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <ZoomIn size={16} />
                            Zoom
                        </label>
                        <div className="flex items-center gap-3">
                            <ZoomOut size={18} className="text-gray-400" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <ZoomIn size={18} className="text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600 w-12 text-right">{zoom.toFixed(1)}x</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={createCroppedImage}
                            disabled={isProcessing}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Crop size={18} />
                                    Potong & Simpan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
