export class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    randn(): number {
        let u = 0, v = 0;
        while (u === 0) u = this.next();
        while (v === 0) v = this.next();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
}

export function generateHyperplanes(k: number, seed: number): Float32Array[] {
    const rng = new SeededRandom(seed);
    const hyperplanes: Float32Array[] = [];
    for (let i = 0; i < k; i++) {
        const plane = new Float32Array(128);
        for (let j = 0; j < 128; j++) {
            plane[j] = rng.randn();
        }
        hyperplanes.push(plane);
    }
    return hyperplanes;
}

export class LSH {
    private hyperplanes: Float32Array[];

    constructor(hyperplanes: Float32Array[]) {
        if (hyperplanes.length === 0) {
            throw new Error("At least one hyperplane is required.");
        }
        this.hyperplanes = hyperplanes;
    }

    hash(vector: Float32Array): number {
        let norm = 0;
        for (const val of vector) {
            norm += val * val;
        }

        norm = Math.sqrt(norm);
        if (norm === 0) {
            return 0;
        }

        const normalized = new Float32Array(128);
        for (let i = 0; i < 128; i++) {
            normalized[i] = vector[i] / norm;
        }

        let hash = 0;
        for (let i = 0; i < this.hyperplanes.length; i++) {
            const plane = this.hyperplanes[i];
            let dotProduct = 0;
            for (let j = 0; j < 128; j++) {
                dotProduct += normalized[j] * plane[j];
            }
            if (dotProduct >= 0) {
                hash |= 1 << i;
            }
        }
        return hash;
    }
}