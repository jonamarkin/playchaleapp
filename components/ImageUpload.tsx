'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    currentImage?: string;
    onImageSelected: (file: File) => void;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageSelected, className = '' }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            onImageSelected(file);
        }
    };

    const currentDisplayImage = previewUrl || currentImage || 'https://i.pravatar.cc/150?u=custom';

    return (
        <div className={`relative group cursor-pointer ${className}`} onClick={() => fileInputRef.current?.click()}>
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-[#C6FF00] transition-colors shadow-2xl">
                <Image
                    src={currentDisplayImage}
                    alt="Profile Avatar"
                    fill
                    sizes="(max-width: 768px) 128px, 160px"
                    className="object-cover"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <ICONS.Plus className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Change</span>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <div className="absolute -bottom-2 -right-2 bg-[#C6FF00] text-black p-2 rounded-full shadow-lg border-4 border-black">
                <ICONS.Plus className="w-4 h-4" />
            </div>
        </div>
    );
};

export default ImageUpload;
