"use client";

import { useState } from "react";
import { Palette, Brush, Check } from "lucide-react";

const ART_STYLES = [
    { id: "cartoon", name: "Cartoon", desc: "Classic bold outlines" },
    { id: "3d", name: "3D Render", desc: "Soft shadows & depth" },
    { id: "minimal", name: "Minimalist", desc: "Clean & simple" },
    { id: "sketch", name: "Hand-drawn", desc: "Arty sketch vibe" },
];

const COLOR_PALETTES = [
    { id: "preppy", name: "Preppy", colors: ["#000080", "#FF69B4", "#4CBB17"] },
    { id: "pastel", name: "Pastel", colors: ["#FFB7B2", "#B2E2F2", "#FDFD96"] },
    { id: "retro", name: "Retro", colors: ["#FF4E50", "#FC913A", "#F9D423"] },
    { id: "mono", name: "B&W", colors: ["#000000", "#666666", "#FFFFFF"] },
];

interface CustomizerProps {
    onSelectStyle: (style: string) => void;
    onSelectPalette: (palette: string) => void;
}

export default function Customizer({ onSelectStyle, onSelectPalette }: CustomizerProps) {
    const [selectedStyle, setSelectedStyle] = useState("cartoon");
    const [selectedPalette, setSelectedPalette] = useState("preppy");

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Art Style Section */}
            <div>
                <h3 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
                    <Brush className="text-pink w-5 h-5" /> Choose Your Style
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ART_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => {
                                setSelectedStyle(style.id);
                                onSelectStyle(style.id);
                            }}
                            className={`p-3 rounded-2xl border-2 transition-all text-left ${selectedStyle === style.id
                                    ? "border-pink bg-pink/5 ring-4 ring-pink/10"
                                    : "border-navy/5 bg-white hover:border-navy/20"
                                }`}
                        >
                            <p className={`font-black text-sm ${selectedStyle === style.id ? "text-pink" : "text-navy"}`}>
                                {style.name}
                            </p>
                            <p className="text-[10px] font-bold text-navy/40 uppercase tracking-tight">{style.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Palette Section */}
            <div>
                <h3 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
                    <Palette className="text-pink w-5 h-5" /> Pick a Vibe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {COLOR_PALETTES.map((palette) => (
                        <button
                            key={palette.id}
                            onClick={() => {
                                setSelectedPalette(palette.id);
                                onSelectPalette(palette.id);
                            }}
                            className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedPalette === palette.id
                                    ? "border-pink bg-pink/5 ring-4 ring-pink/10"
                                    : "border-navy/5 bg-white hover:border-navy/20"
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <p className={`font-black text-sm ${selectedPalette === palette.id ? "text-pink" : "text-navy"}`}>
                                    {palette.name}
                                </p>
                                <div className="flex gap-1">
                                    {palette.colors.map((c, i) => (
                                        <div key={i} className="w-3 h-3 rounded-full border border-navy/10" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                            {selectedPalette === palette.id && <Check className="text-pink w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
