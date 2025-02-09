declare module "@agtabesh/lsh" {
    class Instance {
        addDocument(id: number, document: string): void;
        query(query: {id?: number, text?: string, bucketSize?: number}): string;
    }

    class Lsh {
        getInstance(config: {
            storage: string,
            shingleSize: number,
            numberOfHashFunctions: number,
        }): Instance
    }

    export default Lsh;
}