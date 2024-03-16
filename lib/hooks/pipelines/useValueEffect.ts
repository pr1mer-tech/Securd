import { useCallback, useRef, useState } from "react";

export type Effect<T> = AsyncGenerator<T, void, unknown>;

export function useValueEffect<T>(defaultValue: T, maxIterations = 100, timeout = 60000) {
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const generatorBuilderRef = useRef(null as (() => Effect<T>) | null);
    const generatorRef = useRef(null as Effect<T> | null);
    const iterationCountRef = useRef(0);
    const timeoutIdRef = useRef(null as NodeJS.Timeout | null);

    const setGenerator = useCallback((generator: () => Effect<T>) => {
        generatorBuilderRef.current = generator;
        generatorRef.current = generator();
        iterationCountRef.current = 0;
        next();
    }, []);

    const next = useCallback(async () => {
        if (generatorRef.current) {
            if (iterationCountRef.current >= maxIterations) {
                console.warn("Maximum iteration limit reached. Resetting the generator.");
                reset();
                return;
            }

            try {
                timeoutIdRef.current = setTimeout(() => {
                    console.warn("Generator execution timed out. Resetting the generator.");
                    reset();
                }, timeout);

                const partialResult = await generatorRef.current.next();

                if (!partialResult.done) {
                    setCurrentValue(partialResult.value);
                } else {
                    reset();
                    return;
                }

                const result = await generatorRef.current.next(partialResult.value);
                if (!result.done) {
                    setCurrentValue(result.value);
                } else {
                    reset();
                    return;
                }

                iterationCountRef.current++;
            } catch (e) {
                console.error(e);
                reset();
            } finally {
                if (timeoutIdRef.current) {
                    clearTimeout(timeoutIdRef.current);
                }
            }
        }
    }, []);

    const reset = useCallback(() => {
        generatorRef.current = generatorBuilderRef.current?.() ?? null;
        iterationCountRef.current = 0;
        setCurrentValue(defaultValue);
        next();
    }, []);

    return [currentValue, next, reset, setGenerator] as const;
}