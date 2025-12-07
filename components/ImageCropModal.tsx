import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Crop, Settings, Lock, Unlock } from 'lucide-react';

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

const PPI = 96; // Pixels Per Inch (Standard for web)
const CM_TO_PX = PPI / 2.54;

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    imageUrl,
    onCropComplete,
    onCancel,
    aspectRatio: initialAspectRatio = 16 / 9
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Resizing State
    const [enableResize, setEnableResize] = useState(false);
    const [resizeUnit, setResizeUnit] = useState<'px' | 'cm' | 'inch'>('px');
    const [resizeWidth, setResizeWidth] = useState<string>('');
    const [resizeHeight, setResizeHeight] = useState<string>('');
    const [currentAspectRatio, setCurrentAspectRatio] = useState(initialAspectRatio);
    const [lockAspectRatio, setLockAspectRatio] = useState(true);

    const onCropChange = useCallback((crop: { x: number; y: number }) => {
        setCrop(crop);
    }, []);

    const onZoomChange = useCallback((zoom: number) => {
        setZoom(zoom);
    }, []);

    const onCropAreaChange = useCallback((_: any, croppedAreaPixels: CropArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Update aspect ratio when resize dimensions change
    useEffect(() => {
        if (enableResize && resizeWidth && resizeHeight) {
            const w = parseFloat(resizeWidth);
            const h = parseFloat(resizeHeight);
            if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                setCurrentAspectRatio(w / h);
            }
        } else if (!enableResize) {
            setCurrentAspectRatio(initialAspectRatio);
        }
    }, [enableResize, resizeWidth, resizeHeight, initialAspectRatio]);

    const toPixels = (value: number, unit: 'px' | 'cm' | 'inch') => {
        if (unit === 'cm') return Math.round(value * CM_TO_PX);
        if (unit === 'inch') return Math.round(value * PPI);
        return Math.round(value);
    };

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

            // Determine output size
            let outputWidth = croppedAreaPixels.width;
            let outputHeight = croppedAreaPixels.height;

            if (enableResize && resizeWidth && resizeHeight) {
                const w = parseFloat(resizeWidth);
                const h = parseFloat(resizeHeight);
                if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                    outputWidth = toPixels(w, resizeUnit);
                    outputHeight = toPixels(h, resizeUnit);
                }
            }

            canvas.width = outputWidth;
            canvas.height = outputHeight;

            // Draw the cropped image onto the canvas, resizing it to the output dimensions
            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                outputWidth,
                outputHeight
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Crop size={20} />
                            Potong & Atur Gambar
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Geser, zoom, dan atur ukuran gambar</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content - Flex Row for Desktop */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Cropper Area */}
                    <div className="flex-1 relative bg-gray-900 min-h-[300px] md:min-h-0">
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={currentAspectRatio}
                            onCropChange={onCropChange}
                            onZoomChange={onZoomChange}
                            onCropComplete={onCropAreaChange}
                        />
                    </div>

                    {/* Sidebar Controls */}
                    <div className="w-full md:w-80 bg-gray-50 border-l flex flex-col overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Zoom Control */}
                            <div>
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
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Resize Controls */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <Settings size={16} />
                                        Atur Ukuran Output
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={enableResize}
                                            onChange={(e) => setEnableResize(e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {enableResize && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Satuan</label>
                                            <div className="flex bg-white rounded-lg border p-1">
                                                {(['px', 'cm', 'inch'] as const).map((u) => (
                                                    <button
                                                        key={u}
                                                        onClick={() => setResizeUnit(u)}
                                                        className={`flex-1 py-1 text-xs font-medium rounded-md transition ${resizeUnit === u ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {u.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Lebar ({resizeUnit})</label>
                                                <input
                                                    type="number"
                                                    value={resizeWidth}
                                                    onChange={(e) => setResizeWidth(e.target.value)}
                                                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Auto"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Tinggi ({resizeUnit})</label>
                                                <input
                                                    type="number"
                                                    value={resizeHeight}
                                                    onChange={(e) => setResizeHeight(e.target.value)}
                                                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Auto"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-400">
                                            *Aspek rasio crop akan menyesuaikan dengan ukuran yang dimasukkan.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t bg-white mt-auto">
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={createCroppedImage}
                                    disabled={isProcessing || (enableResize && (!resizeWidth || !resizeHeight))}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Proses
                                        </>
                                    ) : (
                                        <>
                                            <Crop size={16} />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
