

export function dragElement() {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let iframeWrapper = document.createElement("div");
    let iframeWrapperHeader = document.createElement("div");
    iframeWrapper.id = "iframeWrapper";
    iframeWrapperHeader.id = "iframeWrapperHeader"
    iframeWrapper.onmousedown = dragMouseDown;
    function dragMouseDown(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        iframeWrapper.style.top = (iframeWrapper.offsetTop - pos2) + "px";
        iframeWrapper.style.left = (iframeWrapper.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
    return iframeWrapper;
}