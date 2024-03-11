import { useCallback, useRef, useState } from "react";

export type Effect<T> = AsyncGenerator<T, void, unknown>;

export function useValueEffect<T>(defaultValue: T) {
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const generatorBuilderRef = useRef(null as (() => Effect<T>) | null);
    const generatorRef = useRef(null as Effect<T> | null);

    const setGenerator = useCallback((generator: () => Effect<T>) => {
        generatorBuilderRef.current = generator;
        generatorRef.current = generator();
        next();
    }, []);

    const next = useCallback(async () => {
        if (generatorRef.current) {
            try {
                const partialResult = await generatorRef.current.next();

                if (!partialResult.done) {
                    setCurrentValue(partialResult.value);
                } else {
                    reset();
                }

                const result = await generatorRef.current.next(partialResult.value);
                if (!result.done) {
                    setCurrentValue(result.value);
                } else {
                    reset();
                }
            } catch (e) {
                console.error(e);
                reset();
            }
        }
    }, []);

    const reset = useCallback(() => {
        generatorRef.current = generatorBuilderRef.current?.() ?? null;
        setCurrentValue(defaultValue);
        next();
    }, []);

    return [currentValue, next, reset, setGenerator] as const;
}