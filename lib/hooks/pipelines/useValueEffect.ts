import { useCallback, useRef, useState } from "react";

export type Effect<T> = AsyncGenerator<T, void, unknown>;

export function useValueEffect<T>(defaultValue: T, maxIterations = 100, timeout = 60000) {
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const generatorBuilderRef = useRef<(() => Effect<T>) | null>(null);
    const generatorRef = useRef<Effect<T> | null>(null);
    const iterationCountRef = useRef(0);
    const timeoutIdRef = useRef<NodeJS.Timeout | Timer | null>(null);
    const isRunningRef = useRef(false); // To prevent re-entrant calls

    const reset = useCallback(() => {
        generatorRef.current = generatorBuilderRef.current?.() ?? null;
        iterationCountRef.current = 0;
        setCurrentValue(defaultValue);
        isRunningRef.current = false; // Ensure isRunning is reset
        next(); // Invoke next to start running the generator
    }, [defaultValue]);

    const next = useCallback(async () => {
        if (isRunningRef.current || !generatorRef.current) return; // Prevent re-entry
        isRunningRef.current = true;
        
        try {
            if (iterationCountRef.current >= maxIterations) {
                console.warn("Maximum iteration limit reached. Resetting the generator.");
                reset();
                return;
            }

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
            isRunningRef.current = false; // Reset running state
        }
    }, [maxIterations, timeout, reset]);

    const setGenerator = useCallback((generator: () => Effect<T>) => {
        generatorBuilderRef.current = generator;
        generatorRef.current = generator();
        iterationCountRef.current = 0;
        next(); // Note that we immediately initiate the first run
    }, [next]);

    return [currentValue, next, reset, setGenerator] as const;
}