import * as path from 'node:path';
import * as fs from 'node:fs';
import player from 'play-sound';

export class AudioManager {
    private audioFiles: string[] = [];
    private lastPlayedFile: string | undefined;
    private readonly audioDir: string;
    private readonly audioPlayer: ReturnType<typeof player>;

    constructor(extensionPath: string) {
        this.audioDir = path.join(extensionPath, 'audio');
        this.audioPlayer = player({});
        this.loadAudioFiles();
    }

    private loadAudioFiles(): void {
        try {
            if (fs.existsSync(this.audioDir)) {
                this.audioFiles = fs.readdirSync(this.audioDir).filter(file => {
                    // Filter for common audio file extensions
                    const ext = path.extname(file).toLowerCase();
                    return ['.aiff', '.aif', '.mp3', '.wav', '.m4a', '.ogg'].includes(ext);
                });
                console.log(`Found ${this.audioFiles.length} audio files:`, this.audioFiles);
            } else {
                console.warn('Audio directory not found:', this.audioDir);
            }
        } catch (error) {
            console.error('Error reading audio directory:', error);
        }
    }

    public hasAudioFiles(): boolean {
        return this.audioFiles.length > 0;
    }

    public playRandomAudio(): void {
        if (this.audioFiles.length === 0) {
            console.warn('No audio files found in audio directory');
            return;
        }

        // Randomly select an audio file (avoid playing the same one twice in a row)
        let selectedFile: string;
        
        do {
            const randomIndex = Math.floor(Math.random() * this.audioFiles.length);
            selectedFile = this.audioFiles[randomIndex];
        } while (this.audioFiles.length > 1 && selectedFile === this.lastPlayedFile);
        
        this.lastPlayedFile = selectedFile;
        const audioPath = path.join(this.audioDir, selectedFile);
        
        console.log(`Playing audio file: ${selectedFile}`);
        
        // Play audio file using play-sound (cross-platform)
        this.audioPlayer.play(audioPath, (err: Error | null) => {
            if (err) {
                console.error('Error playing sound:', err);
            } else {
                console.log('Sound played!');
            }
        });
    }
}
