import { FEATURE_AGE_VERIFICATION } from "./constants";


export function dragElement(feature: string) {
    const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
    const iframeWrapper = document.createElement("div");
    const iframeWrapperHeader = document.createElement("div");

    iframeWrapper.id = "iframeWrapper";
    iframeWrapperHeader.id = "iframeWrapperHeader";
    if (feature === FEATURE_AGE_VERIFICATION.feature) {
        iframeWrapper.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.15);
      border-radius: 8px;
    `;
    } else {
        iframeWrapper.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      top: 1%;
      left: 75%;
      background: white;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.15);
      border-radius: 8px;
    `;
    }
    iframeWrapperHeader.style.cssText = `
  height: 4px;
  width: 40%;
  cursor: move;
  position: absolute;
  background: #cecece;
  top: 0;
  left: 30%;
  transform: translateY(0);
  transition: all 0.3s ease;
  border-radius: 4px;
`;

    iframeWrapperHeader.title = 'Drag to move';

    // Hover effect (only for desktop)
    iframeWrapperHeader.onmouseenter = () => {
        if (!isMobile) {
            iframeWrapperHeader.style.height = '14px';
            iframeWrapperHeader.style.background = `#cecece`;
        }
    };

    iframeWrapperHeader.onmouseup = () => {
        if (!isMobile) {
            iframeWrapperHeader.style.height = '4px';
            iframeWrapperHeader.style.background = '#cecece';
        }
        closeDragElement();
    };
    // Dragging only enabled for non-mobile
    if (!isMobile) {
        iframeWrapperHeader.onmousedown = dragMouseDown;
    } else {
        // Fullscreen style for mobile
        iframeWrapper.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;
    }

    // Attach header
    iframeWrapper.appendChild(iframeWrapperHeader);

    // Dragging handlers
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        iframeWrapper.style.top = (iframeWrapper.offsetTop - pos2) + "px";
        iframeWrapper.style.left = (iframeWrapper.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    return iframeWrapper;
}