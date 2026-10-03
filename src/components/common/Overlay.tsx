import { ReactNode, useEffect } from "react";

let openOverlays = 0;
let previousBodyOverflow = "";

export function Overlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (openOverlays === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openOverlays += 1;
    return () => {
      openOverlays -= 1;
      if (openOverlays === 0)
        document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div
      onClick={onClose}
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,15,30,0.72)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} className="modal-panel">
        {children}
      </div>
    </div>
  );
}
