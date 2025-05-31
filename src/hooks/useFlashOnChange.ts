import {useEffect, useRef} from "react";

export function useFlashOnChange<T>(value: T, flashClass = "flash", duration = 400) {
    const ref = useRef<HTMLDivElement | null>(null);
    const prevValue = useRef<T>(value);

    useEffect(() => {
        if (prevValue.current !== value && ref.current) {
            ref.current.classList.add(flashClass);
            const timeout = setTimeout(() => {
                if (ref.current) {
                    ref.current.classList.remove(flashClass);
                }
            }, duration);
            return () => clearTimeout(timeout);
        }
        prevValue.current = value;
    }, [value, flashClass, duration]);

    return ref;
}