import { useEffect } from "react";
import { useBHSAStore } from "../stores/bhsaStore";

export function useBHSAInit() {
  const checkStatus = useBHSAStore((s) => s.checkStatus);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);
}
