import { useRef, useState } from "react";

export default function useRecaptcha() {
    const recaptchaRef = useRef(null);
    const [isCaptchaValid, setIsCaptchaValid] = useState(false);

    const getToken = () => recaptchaRef.current?.getValue();
    const resetCaptcha = () => recaptchaRef.current?.reset();


    return {
        recaptchaRef,
        isCaptchaValid,
        setIsCaptchaValid,
        getToken,
        resetCaptcha,
    };
}
